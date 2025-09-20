// src/app/api/staff/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF']).optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET - Get single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        assignedReports: {
          include: {
            department: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            assignedReports: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Staff member not found'
      }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json({
      error: 'Failed to fetch staff member'
    }, { status: 500 })
  }
}

// PATCH - Update staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = UpdateUserSchema.parse(body)

    // Check if email is being changed and already exists
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({
          error: 'Email already in use by another user'
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        department: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        department: user.department
      }
    })

  } catch (error) {
    console.error('Error updating staff member:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to update staff member'
    }, { status: 500 })
  }
}

// DELETE - Delete staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has assigned reports
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            assignedReports: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'Staff member not found'
      }, { status: 404 })
    }

    if (user._count.assignedReports > 0) {
      return NextResponse.json({
        error: 'Cannot delete staff member with assigned reports. Please reassign reports first.'
      }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json({
      error: 'Failed to delete staff member'
    }, { status: 500 })
  }
}
