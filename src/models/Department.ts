// src/models/Department.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  code: string
  email: string
  phone?: string
  description?: string
  isActive: boolean
  avgResolutionDays?: number
  createdAt: Date
  updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  avgResolutionDays: { type: Number, min: 0 }
}, {
  timestamps: true
})

// Indexes
DepartmentSchema.index({ code: 1 })
DepartmentSchema.index({ name: 1 })
DepartmentSchema.index({ isActive: 1 })

export const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema)
