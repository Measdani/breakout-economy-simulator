import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'The National AI Economy Resiliency Model (NAIERM)',
  description: 'Policy-grade simulator for revenue architecture, BEL/SBI, and national social program resilience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="appShell">
          <main className="appMain">{children}</main>
        </div>
      </body>
    </html>
  )
}

