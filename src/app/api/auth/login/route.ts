// src/app/api/auth/login/route.ts (Enhanced)
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    console.log('Login attempt for:', email) // Debug log

    const result = await AuthService.login(email, password)
    
    console.log('Login successful for user:', result.user.role) // Debug log

    const response = NextResponse.json({
      success: true,
      user: result.user
    })

    // Set HTTP-only cookie with proper options
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/' // Ensure cookie is available for all paths
    })

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Login failed'
    }, { status: 400 })
  }
}
