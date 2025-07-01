import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, Cinzel, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const cinzel = Cinzel({ 
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap'
})
const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'IA Education - Aprende Matemáticas con IA',
  description: 'Plataforma educativa que combina aprendizaje matemático con alfabetización en IA a través de un sistema de juego de cartas.',
  keywords: ['educación', 'matemáticas', 'IA', 'niños', 'juego', 'cartas'],
  authors: [{ name: 'IA Education Team' }],
  // manifest: '/manifest.json', // Temporarily disabled until icons are created
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} ${cinzel.variable} ${playfairDisplay.variable} h-full bg-background-primary antialiased`}>
        <div className="flex min-h-full flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 