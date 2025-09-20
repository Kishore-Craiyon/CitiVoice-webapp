// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Report, Status } from '@/models/Report'
import { Department } from '@/models/Department'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const timeframe = parseInt(searchParams.get('timeframe') || '30') // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    const [
      totalReports,
      resolvedReports,
      inProgressReports,
      pendingReports,
      categoryStats,
      priorityStats,
      departmentStats,
      dailyTrends
    ] = await Promise.all([
      // Total reports
      Report.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Resolved reports
      Report.countDocuments({ 
        createdAt: { $gte: startDate }, 
        status: Status.RESOLVED 
      }),
      
      // In progress reports
      Report.countDocuments({ 
        createdAt: { $gte: startDate }, 
        status: Status.IN_PROGRESS 
      }),
      
      // Pending reports
      Report.countDocuments({ 
        createdAt: { $gte: startDate }, 
        status: { $in: [Status.SUBMITTED, Status.ACKNOWLEDGED] }
      }),
      
      // Category breakdown
      Report.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Priority breakdown
      Report.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Department performance
      Report.aggregate([
        { $match: { createdAt: { $gte: startDate }, departmentId: { $exists: true } } },
        {
          $lookup: {
            from: 'departments',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'department'
          }
        },
        { $unwind: '$department' },
        {
          $group: {
            _id: '$department.name',
            count: { $sum: 1 },
            avgResolutionDays: {
              $avg: {
                $cond: [
                  { $ne: ['$actualResolutionDate', null] },
                  {
                    $divide: [
                      { $subtract: ['$actualResolutionDate', '$createdAt'] },
                      1000 * 60 * 60 * 24 // Convert to days
                    ]
                  },
                  null
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Daily trends
      Report.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    const resolutionRate = totalReports > 0 
      ? Math.round((resolvedReports / totalReports) * 100) 
      : 0

    // Calculate average resolution days
    const resolvedReportsWithDates = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: Status.RESOLVED,
          actualResolutionDate: { $exists: true }
        }
      },
      {
        $project: {
          resolutionDays: {
            $divide: [
              { $subtract: ['$actualResolutionDate', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$resolutionDays' }
        }
      }
    ])

    const avgResolutionDays = resolvedReportsWithDates.length > 0 
      ? Math.round(resolvedReportsWithDates[0].avgDays) 
      : 0

    const analytics = {
      overview: {
        totalReports,
        resolvedReports,
        inProgressReports,
        pendingReports,
        resolutionRate,
        avgResolutionDays
      },
      breakdown: {
        byCategory: categoryStats.map(item => ({
          category: item._id,
          count: item.count
        })),
        byPriority: priorityStats.map(item => ({
          priority: item._id,
          count: item.count
        })),
        byDepartment: departmentStats.map(item => ({
          department: item._id,
          count: item.count,
          avgDays: Math.round(item.avgResolutionDays || 0)
        }))
      },
      trends: {
        daily: dailyTrends.map(item => ({
          date: item._id,
          count: item.count
        }))
      }
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json({
      error: 'Failed to generate analytics'
    }, { status: 500 })
  }
}