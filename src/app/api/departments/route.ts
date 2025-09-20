// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Department } from '@/models/Department'
import { User } from '@/models/Users'
import { Report } from '@/models/Report'
import { z } from 'zod'

const CreateDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  description: z.string().optional()
})

// GET - List all departments with stats
export async function GET() {
  try {
    await connectDB()
    
    const departments = await Department.find({ isActive: true }).sort({ name: 1 })
    
    // Get additional stats for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const [staffCount, reportCount] = await Promise.all([
          User.countDocuments({ departmentId: dept._id, isActive: true }),
          Report.countDocuments({ departmentId: dept._id })
        ])
        
        return {
          ...dept.toObject(),
          staffCount,
          reportCount
        }
      })
    )

    return NextResponse.json({ 
      success: true,
      departments: departmentsWithStats 
    })

  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({
      error: 'Failed to fetch departments'
    }, { status: 500 })
  }
}

// POST - Create new department
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const validatedData = CreateDepartmentSchema.parse(body)

    // Check if department already exists
    const existingDept = await Department.findOne({
      $or: [
        { name: validatedData.name },
        { code: validatedData.code.toUpperCase() }
      ]
    })

    if (existingDept) {
      return NextResponse.json({
        error: 'Department with this name or code already exists'
      }, { status: 400 })
    }

    const department = new Department({
      ...validatedData,
      code: validatedData.code.toUpperCase()
    })

    await department.save()

    return NextResponse.json({
      success: true,
      department
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating department:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create department'
    }, { status: 500 })
  }
}
