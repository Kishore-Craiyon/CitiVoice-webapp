// src/app/admin/staff/page.tsx
import AdminSidebar from '@/components/admin/AdminSidebar'
import StaffManager from '@/components/admin/StaffManager'

// This would normally get user from server-side auth
const mockUser = {
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN'
}

export default function AdminStaffPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={mockUser} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <StaffManager />
        </div>
      </div>
    </div>
  )
}