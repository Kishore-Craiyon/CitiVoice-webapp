// src/app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Report, Status } from '@/models/Report'
import { StatusUpdate } from '@/models/StatusUpdate'
import { z } from 'zod'
import mongoose from 'mongoose'

const UpdateReportSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  assignedToId: z.string().optional(),
  comment: z.string().optional(),
  updatedById: z.string().min(1),
  resolutionNotes: z.string().optional()
})

// GET - Get single report with status history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    const [report, statusUpdates] = await Promise.all([
      Report.findById(params.id)
        .populate('departmentId', 'name code email')
        .populate('assignedToId', 'firstName lastName email'),
      StatusUpdate.find({ reportId: params.id })
        .populate('updatedById', 'firstName lastName')
        .sort({ createdAt: -1 })
    ])

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      report: {
        ...report.toObject(),
        statusHistory: statusUpdates
      }
    })

  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({
      error: 'Failed to fetch report'
    }, { status: 500 })
  }
}

// PATCH - Update report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = UpdateReportSchema.parse(body)

    const report = await Report.findById(params.id)
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const oldStatus = report.status

    // Update report fields
    const updateData: any = {}
    if (validatedData.assignedToId) updateData.assignedToId = validatedData.assignedToId
    if (validatedData.resolutionNotes) updateData.resolutionNotes = validatedData.resolutionNotes
    if (validatedData.status) {
      updateData.status = validatedData.status
      if (validatedData.status === Status.RESOLVED) {
        updateData.actualResolutionDate = new Date()
      }
    }

    const updatedReport = await Report.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('departmentId', 'name code')
     .populate('assignedToId', 'firstName lastName')

    // Create status update if status changed
    if (validatedData.status && validatedData.status !== oldStatus) {
      const statusUpdate = new StatusUpdate({
        reportId: params.id,
        oldStatus,
        newStatus: validatedData.status,
        comment: validatedData.comment,
        updatedById: validatedData.updatedById,
        updateType: 'MANUAL'
      })

      await statusUpdate.save()
    }

    return NextResponse.json({
      success: true,
      report: updatedReport
    })

  } catch (error) {
    console.error('Error updating report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to update report'
    }, { status: 500 })
  }
}
