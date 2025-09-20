// src/app/api/staff/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User, UserRole } from '@/models/Users'
import { Report } from '@/models/Report'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const CreateUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  departmentId: z.string().optional()
})

// GET - List staff with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const department = searchParams.get('department')

    const filter: any = {}
    if (role) filter.role = role
    if (department) filter.departmentId = department

    const users = await User.find(filter)
      .populate('departmentId', 'name code')
      .select('-password') // Exclude password from response
      .sort({ role: 1, lastName: 1 })

    // Get assigned reports count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const assignedReportsCount = await Report.countDocuments({ 
          assignedToId: user._id 
        })
        
        return {
          ...user.toObject(),
          assignedReportsCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithStats
    })

  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({
      error: 'Failed to fetch staff'
    }, { status: 500 })
  }
}

// POST - Create new staff member
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const validatedData = CreateUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists with this email'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = new User({
      ...validatedData,
      password: hashedPassword
    })

    await user.save()
    await user.populate('departmentId', 'name code')

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.departmentId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating staff member:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create staff member'
    }, { status: 500 })
  }
}