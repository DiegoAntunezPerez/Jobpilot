import mongoose, { Document, Schema } from 'mongoose'

export type ApplicationStatus =
  | 'aplicado'
  | 'en_proceso'
  | 'primera_entrevista'
  | 'segunda_entrevista'
  | 'oferta'
  | 'rechazado'
  | 'descartado'

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  jobId: string
  jobTitle: string
  company: string
  location?: string
  portal: string
  urlOriginal?: string
  salary?: string
  dateApplied: Date
  status: ApplicationStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    jobId: { type: String, required: true },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    portal: { type: String, required: true },
    urlOriginal: { type: String },
    salary: { type: String },
    dateApplied: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: [
        'aplicado',
        'en_proceso',
        'primera_entrevista',
        'segunda_entrevista',
        'oferta',
        'rechazado',
        'descartado'
      ],
      default: 'aplicado'
    },
    notes: {
      type: String,
      maxlength: [2000, 'Las notas no pueden superar 2.000 caracteres']
    }
  },
  { timestamps: true }
)

applicationSchema.index({ userId: 1, dateApplied: -1 })

export const Application = mongoose.model<IApplication>(
  'Application',
  applicationSchema
)
