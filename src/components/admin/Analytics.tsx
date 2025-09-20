// src/components/admin/Analytics.tsx
'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
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
  trends: {
    daily: Array<{ date: string; count: number }>
    monthly: Array<{ month: string; count: number }>
  }
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30') // days

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`)
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Unable to load analytics data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

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

      {/* Category Breakdown */}
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
  )
}