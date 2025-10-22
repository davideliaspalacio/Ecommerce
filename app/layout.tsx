import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from '@/contexts/AuthContext'
import { ProductsProvider } from '@/contexts/ProductsContext'
import WhatAppButton from '@/components/ui/whatAppButton'

import './globals.css'

export const metadata: Metadata = {
  title: 'ENOUGH®',
  description: 'ENOUGH®',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <ProductsProvider>
            {children}
            <WhatAppButton />
            <Analytics />
            <SpeedInsights />
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
