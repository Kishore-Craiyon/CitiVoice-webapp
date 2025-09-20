// src/lib/auth.ts (Enhanced with better error handling)
import { User, IUser, UserRole } from '@/models/Users'
import { Department } from '@/models/Department'
import { connectDB } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  departmentId?: string
  department?: {
    name: string
    code: string
  }
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
  private static JWT_EXPIRES_IN = '7d'

  static async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    departmentId?: string
    phone?: string
  }) {
    try {
      await connectDB()

      console.log('🔍 Checking for existing user:', userData.email)
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })
      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      })

      await user.save()
      console.log('✅ User created successfully:', user.email)

      // Populate department info if needed
      if (user.departmentId) {
        await user.populate('departmentId', 'name code')
      }

      // Generate token
      const token = this.generateToken(user)

      return {
        user: this.sanitizeUser(user),
        token
      }
    } catch (error) {
      console.error('🚨 Registration error:', error)
      throw error
    }
  }

  static async login(email: string, password: string) {
    try {
      await connectDB()

      console.log('🔍 Looking for user:', email)

      // Find user with department info
      const user = await User.findOne({ email: email.toLowerCase() })
        .populate('departmentId', 'name code')
      
      if (!user) {
        console.log('🚫 User not found:', email)
        throw new Error('Invalid email or password')
      }

      if (!user.isActive) {
        console.log('🚫 User account deactivated:', email)
        throw new Error('Account is deactivated')
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log('🚫 Invalid password for user:', email)
        throw new Error('Invalid email or password')
      }

      // Update last login
      user.lastLoginAt = new Date()
      await user.save()

      console.log('✅ Login successful for:', email, 'Role:', user.role)

      // Generate token
      const token = this.generateToken(user)

      return {
        user: this.sanitizeUser(user),
        token
      }
    } catch (error) {
      console.error('🚨 Login error:', error)
      throw error
    }
  }

  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      if (!token) {
        console.log('🚫 No token provided')
        return null
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      console.log('🔍 Token decoded for user ID:', decoded.userId)
      
      await connectDB()
      const user = await User.findById(decoded.userId)
        .populate('departmentId', 'name code')
        .select('-password') // Don't return password

      if (!user || !user.isActive) {
        console.log('🚫 User not found or inactive:', decoded.userId)
        return null
      }

      console.log('✅ Token verified for user:', user.email, 'Role:', user.role)
      return this.sanitizeUser(user)
    } catch (error) {
      console.error('🚨 Token verification error:', error)
      return null
    }
  }

  private static generateToken(user: IUser): string {
    return jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        role: user.role 
      },
      this.JWT_SECRET,
     { expiresIn: '1h' }
    )
  }

  private static sanitizeUser(user: IUser): AuthUser {
    const result: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId?.toString()
    }

    // Handle populated department
    if (user.departmentId && typeof user.departmentId === 'object') {
      result.department = {
        name: (user.departmentId as any).name,
        code: (user.departmentId as any).code
      }
    }

    return result
  }
}
