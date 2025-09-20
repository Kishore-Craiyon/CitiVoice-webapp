// src/models/User.ts
import mongoose, { Schema, Document, Model, models } from 'mongoose'

export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  STAFF = 'STAFF'
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  role: UserRole
  isActive: boolean
  departmentId?: mongoose.Types.ObjectId
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { 
    type: String, 
    trim: true,
    match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number']
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.STAFF,
    required: true 
  },
  isActive: { type: Boolean, default: true },
  departmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Department' 
  },
  lastLoginAt: { type: Date }
}, {
  timestamps: true
})

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`
})

// Indexes for better query performance
// UserSchema.index({ email: 1 })
// UserSchema.index({ role: 1 })
// UserSchema.index({ departmentId: 1 })
// UserSchema.index({ isActive: 1 })

// Fix the export statement - this is the corrected line
export const User: Model<IUser> = (models && models.User) 
  ? models.User as Model<IUser> 
  : mongoose.model<IUser>('User', UserSchema)