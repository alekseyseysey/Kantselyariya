'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { WishlistItem } from '@/lib/types'

const STORAGE_KEY = 'kantsmir.wishlist.v1'

interface WishlistContextValue {
  items: WishlistItem[]
  totalItems: number
  hydrated: boolean
  hasItem: (id: string) => boolean
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  toggleItem: (item: WishlistItem) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}

export default function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  // `hydrated` отделяет первый клиентский рендер (без localStorage) от
  // последующих — это нужно, чтобы не затереть сохранённый список пустотой
  // на первом проходе и чтобы сердечки не "моргали" из активных в неактивные.
  const [hydrated, setHydrated] = useState(false)

  // Read from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i): i is WishlistItem =>
            typeof i === 'object' && i !== null && 'id' in i && 'name' in i
          ))
        }
      }
    } catch {
      /* corrupt JSON — ignore and start empty */
    }
    setHydrated(true)
  }, [])

  // Persist on every change, but only after hydration.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* quota exceeded or storage disabled — nothing we can do */
    }
  }, [items, hydrated])

  const hasItem = useCallback(
    (id: string) => items.some(i => i.id === id),
    [items],
  )

  const addItem = useCallback((newItem: WishlistItem) => {
    setItems(prev => (prev.some(i => i.id === newItem.id) ? prev : [...prev, newItem]))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === item.id)
      return exists ? prev.filter(i => i.id !== item.id) : [...prev, item]
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{ items, totalItems, hydrated, hasItem, addItem, removeItem, toggleItem, clear }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
