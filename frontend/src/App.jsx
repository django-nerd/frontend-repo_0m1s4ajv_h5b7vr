import React, { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Header({ onSearch }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/30 border-b border-white/10 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <div className="text-xl font-semibold tracking-tight">GameDeals</div>
        <div className="ml-auto w-full max-w-lg">
          <input
            placeholder="Search games, platforms, genres..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg bg-white/60 dark:bg-white/10 px-4 py-2 text-sm outline-none border border-black/10 dark:border-white/10 focus:border-blue-500 transition"
          />
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/jQwvQSncGp8maF9S/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-10 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-sm">Find the best game deals</h1>
        <p className="mt-3 text-white/90 max-w-xl">Browse discounts across Steam, Epic, GOG, PlayStation, Xbox, Nintendo and more. Track wishlists and get alerts when prices drop.</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
    </section>
  )
}

function DealCard({ deal }) {
  return (
    <a href={deal.url} target="_blank" className="group block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold line-clamp-1">{deal.game_slug.replace(/-/g, ' ')}</div>
          <div className="text-xs text-white/70 mt-1">Store #{deal.store}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold">${Number(deal.price).toFixed(2)}</div>
          {deal.original_price && (
            <div className="text-xs text-white/60 line-through">${Number(deal.original_price).toFixed(2)}</div>
          )}
          {deal.discount_pct && (
            <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300">-{Math.round(deal.discount_pct)}%</div>
          )}
        </div>
      </div>
    </a>
  )
}

function DealsGrid({ query }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      try {
        const url = new URL(`${API_BASE}/deals`)
        url.searchParams.set('page', '1')
        url.searchParams.set('size', '24')
        const r = await fetch(url, { signal: controller.signal })
        const data = await r.json()
        setItems(data.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => {
    if (!query) return items
    return items.filter((d) => d.game_slug.includes(query.toLowerCase()))
  }, [items, query])

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Popular deals</h2>
        <a href="#" className="text-sm text-blue-300 hover:underline">See all</a>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [q, setQ] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0b0c14] to-[#0e111a] text-white">
      <Header onSearch={setQ} />
      <div className="pt-16" />
      <Hero />
      <DealsGrid query={q} />
    </div>
  )
}
