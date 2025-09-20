// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface AdminSidebarProps {
  user: {
    firstName: string
    lastName: string
    role: string
    department?: { name: string }
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/reports', label: 'Reports', icon: '📋' },
    { href: '/admin/departments', label: 'Departments', icon: '🏢' },
    { href: '/admin/staff', label: 'Staff Management', icon: '👥' },
  ]

  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Civic Admin</h1>
        <p className="text-sm text-gray-300">Admin Portal</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-300">{user.role}</p>
            {user.department && (
              <p className="text-xs text-gray-400">{user.department.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-700 transition-colors ${
                  pathname === item.href ? 'bg-gray-700 border-r-4 border-blue-500' : ''
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-300 hover:bg-red-900 hover:bg-opacity-50 rounded transition-colors disabled:opacity-50"
        >
          <span>🚪</span>
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  )
}