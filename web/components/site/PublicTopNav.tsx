'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/model', label: 'Model' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function PublicTopNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-border-slate bg-darker-navy/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex flex-wrap items-center gap-4 justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-bright">
          NAIERM
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded text-xs border transition ${
                isActive(item.href)
                  ? 'bg-blue-900/35 border-blue-400 text-blue-200'
                  : 'bg-transparent border-transparent text-dimmed hover:text-bright hover:border-border-slate hover:bg-dark-slate/40'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/model"
          className="px-3 py-1.5 text-xs font-semibold rounded border border-emerald-400 text-emerald-300 hover:bg-emerald-900/30 transition"
        >
          Launch Simulator
        </Link>
      </div>
    </header>
  )
}

