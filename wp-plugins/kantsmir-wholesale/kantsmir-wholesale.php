<?php
/**
 * Plugin Name: KantsMir — Wholesale Requests
 * Description: Принимает POST с фронта Next.js на /wp-json/kantsmir/v1/wholesale, сохраняет заявку как CPT `wholesale_request` и шлёт письмо администратору.
 * Version:     1.0.0
 * Author:      KantsMir
 * License:     GPL-2.0-or-later
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

// Куда уходят уведомления о новых заявках. Можно переопределить в wp-config.php:
//   define('KANTSMIR_NOTIFY_EMAIL', 'sales@example.com');
if (!defined('KANTSMIR_NOTIFY_EMAIL')) {
    define('KANTSMIR_NOTIFY_EMAIL', 'leha.aleksey200258@gmail.com');
}

const KANTSMIR_CPT          = 'wholesale_request';
const KANTSMIR_REST_NS      = 'kantsmir/v1';
const KANTSMIR_MAX_FILE     = 10 * 1024 * 1024; // 10 MB
const KANTSMIR_ALLOWED_MIME = [
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls'  => 'application/vnd.ms-excel',
    'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/* ─── 1. CPT регистрация ───────────────────────────────────────── */

add_action('init', 'kantsmir_register_cpt');
function kantsmir_register_cpt(): void
{
    register_post_type(KANTSMIR_CPT, [
        'labels' => [
            'name'               => 'Заявки оптовиков',
            'singular_name'      => 'Заявка',
            'menu_name'          => 'Заявки оптовиков',
            'all_items'          => 'Все заявки',
            'add_new_item'       => 'Добавить заявку',
            'edit_item'          => 'Редактировать заявку',
            'view_item'          => 'Просмотр заявки',
            'search_items'       => 'Поиск заявок',
            'not_found'          => 'Заявок не найдено',
            'not_found_in_trash' => 'В корзине нет заявок',
        ],
        'public'         => false,
        'show_ui'        => true,
        'show_in_menu'   => true,
        'menu_icon'      => 'dashicons-businessperson',
        'menu_position'  => 25,
        'capability_type' => 'post',
        'supports'       => ['title', 'editor'],
        'has_archive'    => false,
        'rewrite'        => false,
    ]);
}

/* ─── 2. REST endpoint ────────────────────────────────────────── */

add_action('rest_api_init', function () {
    register_rest_route(KANTSMIR_REST_NS, '/wholesale', [
        'methods'             => 'POST',
        'callback'            => 'kantsmir_handle_wholesale',
        'permission_callback' => '__return_true',
    ]);
});

function kantsmir_handle_wholesale(WP_REST_Request $request)
{
    $params = $request->get_params();
    $files  = $request->get_file_params();

    // Honeypot — у нас на фронте есть невидимое поле `website`, бот его заполнит.
    if (!empty(trim((string)($params['website'] ?? '')))) {
        return new WP_REST_Response(['ok' => true, 'id' => 0], 200);
    }

    $name    = sanitize_text_field((string)($params['name']    ?? ''));
    $phone   = sanitize_text_field((string)($params['phone']   ?? ''));
    $email   = sanitize_email((string)($params['email']        ?? ''));
    $orgType = sanitize_text_field((string)($params['orgType'] ?? ''));
    $comment = sanitize_textarea_field((string)($params['comment'] ?? ''));
    $consent = filter_var($params['consent'] ?? false, FILTER_VALIDATE_BOOLEAN);

    if (mb_strlen($name) < 2)  return kantsmir_err('invalid_name',  'Введите имя');
    if (mb_strlen($phone) < 9) return kantsmir_err('invalid_phone', 'Введите корректный телефон');
    if (!is_email($email))     return kantsmir_err('invalid_email', 'Введите корректный e-mail');
    if (empty($orgType))       return kantsmir_err('invalid_org',   'Выберите тип организации');
    if (!$consent)             return kantsmir_err('no_consent',    'Необходимо ваше согласие');

    // 1. Создаём пост.
    $post_id = wp_insert_post([
        'post_type'    => KANTSMIR_CPT,
        'post_status'  => 'publish',
        'post_title'   => sprintf('%s (%s)', $name, $email),
        'post_content' => $comment,
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response([
            'ok'    => false,
            'error' => 'insert_failed',
            'message' => 'Не удалось сохранить заявку',
        ], 500);
    }

    update_post_meta($post_id, '_kantsmir_name',       $name);
    update_post_meta($post_id, '_kantsmir_phone',      $phone);
    update_post_meta($post_id, '_kantsmir_email',      $email);
    update_post_meta($post_id, '_kantsmir_org_type',   $orgType);
    update_post_meta($post_id, '_kantsmir_consent_at', current_time('mysql'));
    update_post_meta($post_id, '_kantsmir_ip',         sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? ''));
    update_post_meta($post_id, '_kantsmir_user_agent', sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''));

    // 2. Если приложен файл — заливаем в Media и крепим к посту.
    $attachment_url = null;
    if (!empty($files['attachment']) && !empty($files['attachment']['tmp_name'])) {
        $upload = kantsmir_handle_upload($files['attachment'], $post_id);
        if (is_wp_error($upload)) {
            // Не валим всю заявку из-за файла — логируем и идём дальше.
            error_log('[kantsmir-wholesale] upload error: ' . $upload->get_error_message());
            update_post_meta($post_id, '_kantsmir_upload_error', $upload->get_error_message());
        } else {
            update_post_meta($post_id, '_kantsmir_attachment_id', $upload['id']);
            $attachment_url = $upload['url'];
        }
    }

    // 3. Письмо админу.
    kantsmir_send_admin_email($post_id, [
        'name' => $name, 'phone' => $phone, 'email' => $email,
        'orgType' => $orgType, 'comment' => $comment,
    ], $attachment_url);

    return new WP_REST_Response([
        'ok' => true,
        'id' => $post_id,
    ], 201);
}

function kantsmir_err(string $code, string $msg): WP_REST_Response
{
    return new WP_REST_Response([
        'ok'      => false,
        'error'   => $code,
        'message' => $msg,
    ], 400);
}

/* ─── 3. Загрузка файла ───────────────────────────────────────── */

function kantsmir_handle_upload(array $file_array, int $post_id)
{
    if (!function_exists('wp_handle_upload')) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }
    if (!function_exists('wp_generate_attachment_metadata')) {
        require_once ABSPATH . 'wp-admin/includes/image.php';
    }

    if ($file_array['size'] > KANTSMIR_MAX_FILE) {
        return new WP_Error('too_large', 'Файл больше 10 МБ');
    }

    $movefile = wp_handle_upload($file_array, [
        'test_form' => false,
        'mimes'     => KANTSMIR_ALLOWED_MIME,
    ]);

    if (isset($movefile['error'])) {
        return new WP_Error('upload_failed', $movefile['error']);
    }

    $attach_id = wp_insert_attachment([
        'post_mime_type' => $movefile['type'],
        'post_title'     => sanitize_file_name(basename($movefile['file'])),
        'post_content'   => '',
        'post_status'    => 'inherit',
        'post_parent'    => $post_id,
    ], $movefile['file'], $post_id);

    wp_update_attachment_metadata(
        $attach_id,
        wp_generate_attachment_metadata($attach_id, $movefile['file'])
    );

    return ['id' => $attach_id, 'url' => $movefile['url']];
}

/* ─── 4. Email уведомление ────────────────────────────────────── */

function kantsmir_send_admin_email(int $post_id, array $data, ?string $attachment_url): void
{
    $admin_link = admin_url('post.php?post=' . $post_id . '&action=edit');
    $subject    = 'Новая заявка от оптовика — ' . $data['name'];

    $body  = '<h2>Новая заявка от оптовика</h2>';
    $body .= '<p><strong>Имя:</strong> '     . esc_html($data['name'])    . '</p>';
    $body .= '<p><strong>Телефон:</strong> ' . esc_html($data['phone'])   . '</p>';
    $body .= '<p><strong>Email:</strong> <a href="mailto:' . esc_attr($data['email']) . '">'
           . esc_html($data['email']) . '</a></p>';
    $body .= '<p><strong>Тип организации:</strong> ' . esc_html($data['orgType']) . '</p>';
    if (!empty($data['comment'])) {
        $body .= '<p><strong>Комментарий:</strong><br>' . nl2br(esc_html($data['comment'])) . '</p>';
    }
    if ($attachment_url) {
        $body .= '<p><strong>Файл-вложение:</strong> <a href="' . esc_url($attachment_url) . '">скачать</a></p>';
    }
    $body .= '<hr><p><a href="' . esc_url($admin_link) . '">Открыть заявку в админке</a></p>';

    wp_mail(
        KANTSMIR_NOTIFY_EMAIL,
        $subject,
        $body,
        ['Content-Type: text/html; charset=UTF-8']
    );
}

/* ─── 5. Колонки и метабокс в админке ─────────────────────────── */

add_filter('manage_' . KANTSMIR_CPT . '_posts_columns', function ($cols) {
    $new = [];
    foreach ($cols as $key => $label) {
        $new[$key] = $label;
        if ($key === 'title') {
            $new['phone']    = 'Телефон';
            $new['email']    = 'Email';
            $new['org_type'] = 'Организация';
        }
    }
    return $new;
});

add_action('manage_' . KANTSMIR_CPT . '_posts_custom_column', function ($col, $post_id) {
    $key = [
        'phone'    => '_kantsmir_phone',
        'email'    => '_kantsmir_email',
        'org_type' => '_kantsmir_org_type',
    ][$col] ?? null;
    if ($key) echo esc_html(get_post_meta($post_id, $key, true));
}, 10, 2);

add_action('add_meta_boxes', function () {
    add_meta_box(
        'kantsmir_wholesale_details',
        'Детали заявки',
        function (WP_Post $post) {
            $rows = [
                'Имя'                => get_post_meta($post->ID, '_kantsmir_name', true),
                'Телефон'            => get_post_meta($post->ID, '_kantsmir_phone', true),
                'Email'              => get_post_meta($post->ID, '_kantsmir_email', true),
                'Тип организации'    => get_post_meta($post->ID, '_kantsmir_org_type', true),
                'IP-адрес'           => get_post_meta($post->ID, '_kantsmir_ip', true),
                'User-agent'         => get_post_meta($post->ID, '_kantsmir_user_agent', true),
                'Согласие получено'  => get_post_meta($post->ID, '_kantsmir_consent_at', true),
            ];
            echo '<table class="form-table"><tbody>';
            foreach ($rows as $label => $val) {
                echo '<tr><th style="width:180px;">' . esc_html($label) . '</th><td>' . esc_html((string)$val) . '</td></tr>';
            }
            echo '</tbody></table>';

            $att_id = (int) get_post_meta($post->ID, '_kantsmir_attachment_id', true);
            if ($att_id) {
                $url = wp_get_attachment_url($att_id);
                if ($url) {
                    echo '<p style="margin-top:12px;"><strong>Вложение:</strong> '
                       . '<a href="' . esc_url($url) . '" target="_blank" rel="noopener">скачать</a></p>';
                }
            }

            $upload_err = get_post_meta($post->ID, '_kantsmir_upload_error', true);
            if ($upload_err) {
                echo '<p style="color:#b32d2e;"><strong>Ошибка загрузки файла:</strong> ' . esc_html($upload_err) . '</p>';
            }
        },
        KANTSMIR_CPT,
        'normal',
        'high'
    );
});
