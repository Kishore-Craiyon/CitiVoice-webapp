// src/models/Report.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export enum Category {
  POTHOLE = 'POTHOLE',
  STREETLIGHT = 'STREETLIGHT',
  TRASH = 'TRASH',
  GRAFFITI = 'GRAFFITI',
  TRAFFIC_SIGNAL = 'TRAFFIC_SIGNAL',
  WATER_LEAK = 'WATER_LEAK',
  NOISE_COMPLAINT = 'NOISE_COMPLAINT',
  PARK_MAINTENANCE = 'PARK_MAINTENANCE',
  ROAD_DAMAGE = 'ROAD_DAMAGE',
  DRAINAGE = 'DRAINAGE',
  ILLEGAL_PARKING = 'ILLEGAL_PARKING',
  TREE_FALLING = 'TREE_FALLING',
  ANIMAL_CONTROL = 'ANIMAL_CONTROL',
  BUILDING_VIOLATION = 'BUILDING_VIOLATION',
  OTHER = 'OTHER'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

export enum Status {
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  DUPLICATE = 'DUPLICATE'
}

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  category: Category
  priority: Priority
  status: Status
  
  // Location
  latitude: number
  longitude: number
  address?: string
  ward?: string
  
  // Media
  imageUrls: string[]
  audioUrl?: string
  
  // Citizen info
  citizenName?: string
  citizenEmail?: string
  citizenPhone?: string
  citizenId?: string
  
  // Assignment
  departmentId?: mongoose.Types.ObjectId
  assignedToId?: mongoose.Types.ObjectId
  
  // Resolution
  resolutionNotes?: string
  resolutionImages: string[]
  estimatedResolutionDate?: Date
  actualResolutionDate?: Date
  
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: Object.values(Category), 
    required: true 
  },
  priority: { 
    type: String, 
    enum: Object.values(Priority), 
    default: Priority.MEDIUM 
  },
  status: { 
    type: String, 
    enum: Object.values(Status), 
    default: Status.SUBMITTED 
  },
  
  // Location
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, trim: true },
  ward: { type: String, trim: true },
  
  // Media
  imageUrls: [{ type: String }],
  audioUrl: { type: String },
  
  // Citizen
  citizenName: { type: String, trim: true },
  citizenEmail: { type: String, lowercase: true, trim: true },
  citizenPhone: { type: String, trim: true },
  citizenId: { type: String, trim: true },
  
  // Assignment
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Resolution
  resolutionNotes: { type: String, trim: true },
  resolutionImages: [{ type: String }],
  estimatedResolutionDate: { type: Date },
  actualResolutionDate: { type: Date }
}, {
  timestamps: true
})

// Indexes for better query performance
ReportSchema.index({ status: 1 })
ReportSchema.index({ category: 1 })
ReportSchema.index({ priority: 1 })
ReportSchema.index({ departmentId: 1 })
ReportSchema.index({ assignedToId: 1 })
ReportSchema.index({ createdAt: -1 })
ReportSchema.index({ latitude: 1, longitude: 1 }) // For location-based queries

export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)
