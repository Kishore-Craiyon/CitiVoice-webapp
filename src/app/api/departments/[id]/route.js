// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Department } from '@/models/Department'
import { z } from 'zod'
import mongoose from 'mongoose'

const UpdateDepartmentSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET - Get single department
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 })
    }

    const department = await Department.findById(params.id)
    
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json({ department })

  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json({
      error: 'Failed to fetch department'
    }, { status: 500 })
  }
}

// PATCH - Update department
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = UpdateDepartmentSchema.parse(body)

    // If updating name or code, check for duplicates
    if (validatedData.name || validatedData.code) {
      const query: any = { _id: { $ne: params.id } }
      if (validatedData.name) query.name = validatedData.name
      if (validatedData.code) query.code = validatedData.code.toUpperCase()

      const existingDept = await Department.findOne(query)
      if (existingDept) {
        return NextResponse.json({
          error: 'Department with this name or code already exists'
        }, { status: 400 })
      }
    }

    const updateData = { ...validatedData }
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    const department = await Department.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      department
    })

  } catch (error) {
    console.error('Error updating department:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to update department'
    }, { status: 500 })
  }
}
