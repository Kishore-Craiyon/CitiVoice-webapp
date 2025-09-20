// src/app/admin/reports/page.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ReportsTable from '@/components/admin/ReportsTable'
import FilterBar from '@/components/shared/FilterBar'

// This would normally get user from server-side auth
const mockUser = {
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN'
}

export default function AdminReportsPage() {
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    department: ''
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={mockUser} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
            <p className="text-gray-600">Monitor and manage all civic issue reports</p>
          </div>
          
          <FilterBar onFiltersChange={setFilters} />
          <ReportsTable filters={filters} />
        </div>
      </div>
    </div>
  )
}