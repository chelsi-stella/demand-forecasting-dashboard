import React from "react"
import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Source_Sans_3 } from 'next/font/google'

// Initialize HelloFresh fonts
const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--hf-font-body',
  display: 'swap',
})

// Note: Agrandir Digital is a custom font and needs to be loaded separately
// Add Agrandir Digital font files to /public/fonts/ or use a CDN
// For now, using Source Sans Pro as fallback for headlines until Agrandir is added

export const metadata: Metadata = {
  title: 'Demand Forecasting | HelloFresh Enterprise',
  description: 'Internal demand forecasting platform for demand planners',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSansPro.variable} antialiased`} style={{ fontFamily: 'var(--hf-font-body)' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
