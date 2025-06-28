import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation'
import { FoodLogProvider } from '../lib/FoodLogContext'
import { AuthProvider } from '../lib/AuthContext'

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
        <AuthProvider>
          <FoodLogProvider>
            {children}
            <Navigation />
          </FoodLogProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
