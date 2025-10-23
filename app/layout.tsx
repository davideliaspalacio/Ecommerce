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
  title: 'ENOUGHH®',
  description: 'ENOUGHH®',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: '/favicon.png',
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
