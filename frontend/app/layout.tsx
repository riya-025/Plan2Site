import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plan2Site AI - Construction Progress Tracking',
  description: 'Bridging the gap between planned work and actual site progress.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        {children}
      </body>
    </html>
  )
}
