// src/models/StatusUpdate.ts
import mongoose, { Schema, Document, Model } from 'mongoose'
import { Status } from './Report'

export interface IStatusUpdate extends Document {
  _id: mongoose.Types.ObjectId
  reportId: mongoose.Types.ObjectId
  oldStatus: Status
  newStatus: Status
  comment?: string
  updatedById?: mongoose.Types.ObjectId
  location?: string
  updateType?: 'SYSTEM' | 'MANUAL' | 'CITIZEN_FEEDBACK'
  createdAt: Date
}

const StatusUpdateSchema = new Schema<IStatusUpdate>({
  reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
  oldStatus: { type: String, enum: Object.values(Status), required: true },
  newStatus: { type: String, enum: Object.values(Status), required: true },
  comment: { type: String, trim: true },
  updatedById: { type: Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, trim: true },
  updateType: { 
    type: String, 
    enum: ['SYSTEM', 'MANUAL', 'CITIZEN_FEEDBACK'],
    default: 'MANUAL'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

// Indexes
StatusUpdateSchema.index({ reportId: 1 })
StatusUpdateSchema.index({ createdAt: -1 })

export const StatusUpdate: Model<IStatusUpdate> = mongoose.models.StatusUpdate || mongoose.model<IStatusUpdate>('StatusUpdate', StatusUpdateSchema)
