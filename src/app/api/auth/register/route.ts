// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { UserRole } from '@/models/Users'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.STAFF]),
  departmentId: z.string().optional(),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userData = RegisterSchema.parse(body)

    const result = await AuthService.register(userData)

    return NextResponse.json({
      success: true,
      user: result.user
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Registration failed'
    }, { status: 400 })
  }
}
