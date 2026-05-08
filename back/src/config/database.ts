import mongoose from 'mongoose'
import { env } from './env'

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(env.MONGO_URI)
    console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`)
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err)
})
