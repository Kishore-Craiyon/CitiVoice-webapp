'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface Props {
  user: {
    id: string
    firstName: string
    lastName: string
    role: string
    email: string
  }
}

interface Analytics {
  overview: {
    totalReports: number
    resolvedReports: number
    inProgressReports: number
    pendingReports: number
    resolutionRate: number
    avgResolutionDays: number
  }
  breakdown: {
    byCategory: Array<{ category: string; count: number }>
    byPriority: Array<{ priority: string; count: number }>
    byDepartment: Array<{ department: string; count: number; avgDays: number }>
  }
}

export default function AdminDashboard({ user }: Props) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics?timeframe=30')
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-gray-800"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          
          {analytics ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.overview.totalReports}
                  </div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.overview.resolvedReports}
                  </div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-orange-600">
                    {analytics.overview.inProgressReports}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-yellow-600">
                    {analytics.overview.pendingReports}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.overview.resolutionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Resolution Rate</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-indigo-600">
                    {analytics.overview.avgResolutionDays}d
                  </div>
                  <div className="text-sm text-gray-600">Avg Resolution</div>
                </div>
              </div>

              {/* Category & Priority Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Reports by Category</h3>
                  <div className="space-y-3">
                    {analytics.breakdown.byCategory.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-3 bg-blue-${(index % 5 + 1) * 100}`}></div>
                          <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Reports by Priority</h3>
                  <div className="space-y-3">
                    {analytics.breakdown.byPriority.map((item) => (
                      <div key={item.priority} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-3 ${
                            item.priority === 'EMERGENCY' ? 'bg-red-600' :
                            item.priority === 'URGENT' ? 'bg-red-400' :
                            item.priority === 'HIGH' ? 'bg-orange-400' :
                            item.priority === 'MEDIUM' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium">{item.priority}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Department</th>
                        <th className="text-left py-2">Reports</th>
                        <th className="text-left py-2">Avg Resolution (days)</th>
                        <th className="text-left py-2">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.breakdown.byDepartment.map((dept) => (
                        <tr key={dept.department} className="border-b">
                          <td className="py-3 font-medium">{dept.department}</td>
                          <td className="py-3">{dept.count}</td>
                          <td className="py-3">{dept.avgDays}</td>
                          <td className="py-3">
                            <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              dept.avgDays <= 3 ? 'bg-green-100 text-green-800' :
                              dept.avgDays <= 7 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {dept.avgDays <= 3 ? 'Excellent' : 
                               dept.avgDays <= 7 ? 'Good' : 'Needs Improvement'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}