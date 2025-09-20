import { connectDB } from '../lib/mongodb'
import { User } from '../models/Users'
import { Department } from '../models/Department'
import { Report } from '../models/Report'
import { StatusUpdate } from '../models/StatusUpdate'
import mongoose from 'mongoose'

async function resetDatabase() {
  console.log('🔄 Resetting database...')

  try {
    await connectDB()

    // Drop all collections
    console.log('🗑️ Dropping all collections...')
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established')
    }
    const collections = await mongoose.connection.db.collections()
    
    for (const collection of collections) {
      await collection.drop()
      console.log(`   ✅ Dropped ${collection.collectionName}`)
    }

    console.log('✨ Database reset completed!')
    console.log('\n🌱 Run "npm run seed" to populate with sample data')

  } catch (error) {
    console.error('❌ Error resetting database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
  }
}

resetDatabase()