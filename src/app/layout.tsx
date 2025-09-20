import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Civic Reporter - Report Community Issues',
  description: 'Report and track civic issues in your community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Civic Reporter
              </Link>
              <div className="space-x-4">
                <Link href="/report" className="text-gray-600 hover:text-blue-600">
                  Report Issue
                </Link>
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}