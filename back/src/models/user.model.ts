import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  location?: string
  cvText?: string
  portfolioUrl?: string
  skills?: string[]
  refreshTokenVersion: number
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar los 100 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'La ubicación no puede superar 100 caracteres']
    },
    cvText: {
      type: String,
      maxlength: [20000, 'El CV no puede superar 20.000 caracteres']
    },
    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'La URL no puede superar 500 caracteres']
    },
    skills: [{ type: String, trim: true }],
    refreshTokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
