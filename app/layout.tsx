import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation'
import { FoodLogProvider } from '../lib/FoodLogContext'

export const metadata: Metadata = {
  title: 'Daily Macros',
  description: 'Track your daily calorie and protein intake',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0E0F1A] min-h-screen">
        <FoodLogProvider>
          {children}
          <Navigation />
        </FoodLogProvider>
      </body>
    </html>
  )
}
