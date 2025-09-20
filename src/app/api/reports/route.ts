// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Report, Category, Priority, Status } from '@/models/Report'
import { Department } from '@/models/Department'
import { StatusUpdate } from '@/models/StatusUpdate'
import { z } from 'zod'

const CreateReportSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  category: z.nativeEnum(Category),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  ward: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  citizenName: z.string().optional(),
  citizenEmail: z.string().email().optional(),
  citizenPhone: z.string().optional(),
})

// Automated routing logic
const CATEGORY_DEPARTMENT_MAP: Record<Category, string> = {
  [Category.POTHOLE]: 'PWD',
  [Category.STREETLIGHT]: 'ELE',
  [Category.TRASH]: 'SAN',
  [Category.GRAFFITI]: 'PAR',
  [Category.TRAFFIC_SIGNAL]: 'TRA',
  [Category.WATER_LEAK]: 'WAT',
  [Category.NOISE_COMPLAINT]: 'COD',
  [Category.PARK_MAINTENANCE]: 'PAR',
  [Category.ROAD_DAMAGE]: 'PWD',
  [Category.DRAINAGE]: 'WAT',
  [Category.ILLEGAL_PARKING]: 'TRA',
  [Category.TREE_FALLING]: 'PAR',
  [Category.ANIMAL_CONTROL]: 'GEN',
  [Category.BUILDING_VIOLATION]: 'COD',
  [Category.OTHER]: 'GEN'
}

const determinePriority = (description: string): Priority => {
  const lowerDesc = description.toLowerCase()
  
  if (lowerDesc.includes('emergency') || lowerDesc.includes('dangerous') || 
      lowerDesc.includes('urgent') || lowerDesc.includes('safety') || 
      lowerDesc.includes('flooding')) {
    return Priority.URGENT
  }
  
  if (lowerDesc.includes('broken') || lowerDesc.includes('not working') || 
      lowerDesc.includes('major') || lowerDesc.includes('significant')) {
    return Priority.HIGH
  }
  
  if (lowerDesc.includes('minor') || lowerDesc.includes('small') || 
      lowerDesc.includes('cosmetic')) {
    return Priority.LOW
  }
  
  return Priority.MEDIUM
}

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const validatedData = CreateReportSchema.parse(body)

    // Auto-route to department
    const departmentCode = CATEGORY_DEPARTMENT_MAP[validatedData.category]
    const department = await Department.findOne({ code: departmentCode, isActive: true })

    // Determine priority
    const priority = determinePriority(validatedData.description)

    // Create report
    const report = new Report({
      ...validatedData,
      priority,
      departmentId: department?._id,
      imageUrls: validatedData.imageUrls || []
    })

    await report.save()

    // Create initial status update
    const statusUpdate = new StatusUpdate({
      reportId: report._id,
      oldStatus: Status.SUBMITTED,
      newStatus: Status.SUBMITTED,
      comment: 'Report submitted by citizen',
      updateType: 'SYSTEM'
    })

    await statusUpdate.save()

    // Populate department info for response
    await report.populate('departmentId', 'name code')

    return NextResponse.json({
      success: true,
      report: {
        id: report._id.toString(),
        title: report.title,
        status: report.status,
        priority: report.priority,
        department: department ? {
          name: department.name,
          code: department.code
        } : null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create report'
    }, { status: 500 })
  }
}

// GET - Fetch reports with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const department = searchParams.get('department')

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (priority) filter.priority = priority
    if (department) filter.departmentId = department

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('departmentId', 'name code')
        .populate('assignedToId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(filter)
    ])

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({
      error: 'Failed to fetch reports'
    }, { status: 500 })
  }
}
