import type { NextConfig } from 'next'

const wpHost = process.env.NEXT_PUBLIC_WORDPRESS_HOST ?? 'kantselariya.local'

// Local By Flywheel / XAMPP / любой локальный WP резолвится в 127.0.0.1.
// Next/Image SSRF-защита блокирует upstream'ы с приватными IP, поэтому
// для dev отключаем оптимизацию полностью. На проде, когда WP переедет
// на публичный домен, эта переменная станет false и оптимизация снова
// заработает (через remotePatterns).
const isDev = process.env.NODE_ENV !== 'production'

const nextConfig: NextConfig = {
  // Next.js 16 в dev-режиме режет cross-origin запросы к RSC/HMR/server-actions.
  // Перечисли здесь все хосты/IP, с которых ты открываешь dev-сервер не через localhost.
  allowedDevOrigins: ['172.22.11.5', 'local-origin.dev', '*.local-origin.dev'],
  images: {
    unoptimized: isDev,
    remotePatterns: [
      { protocol: 'http',  hostname: wpHost, pathname: '/**' },
      { protocol: 'https', hostname: wpHost, pathname: '/**' },
      { protocol: 'https', hostname: 'secure.gravatar.com', pathname: '/**' },
    ],
  },
}

export default nextConfig
