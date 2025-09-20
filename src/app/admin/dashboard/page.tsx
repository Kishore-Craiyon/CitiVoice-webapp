// src/app/admin/dashboard/page.tsx (Fixed Server Component)
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import AdminDashboard from './admindashboard'

// Make this an async server component
export default async function AdminDashboardPage() {
  // Get cookies on server side
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  console.log('Admin dashboard - Token exists:', !!token) // Debug log

  if (!token) {
    console.log('No token found, redirecting to login') // Debug log
    redirect('/auth/login')
  }

  const user = await AuthService.verifyToken(token)
  
  console.log('Admin dashboard - User:', user?.role) // Debug log

  if (!user || user.role !== 'ADMIN') {
    console.log('User not admin or invalid, redirecting') // Debug log
    redirect('/auth/login')
  }

  return <AdminDashboard user={user} />
}
