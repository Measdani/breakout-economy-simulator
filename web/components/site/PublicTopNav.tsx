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
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-3 flex flex-wrap items-center gap-4 justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-bright">
          NAIERM
        </Link>

        <nav className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded text-xs border transition duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-900/35 border-blue-400 text-blue-200 shadow-[0_0_16px_rgba(59,130,246,0.2)]'
                  : 'bg-transparent border-transparent text-dimmed hover:text-bright hover:border-border-slate hover:bg-dark-slate/40 hover:-translate-y-0.5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/model"
          className="px-3.5 py-1.5 text-xs font-semibold rounded border border-emerald-400 text-emerald-300 bg-emerald-900/15 hover:bg-emerald-900/35 transition duration-200 hover:-translate-y-0.5"
        >
          Launch Simulator
        </Link>
      </div>
    </header>
  )
}
