// scripts/seed.ts
import { connectDB } from '../src/lib/mongodb'
import { User, UserRole } from '../src/models/User'
import { Department } from '../src/models/Department'
import { Report, Category, Priority, Status } from '../src/models/Report'
import { StatusUpdate } from '../src/models/StatusUpdate'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

async function main() {
  console.log('🌱 Starting MongoDB seeding...')

  try {
    await connectDB()

    // Clear existing data (optional - remove in production)
    console.log('🗑️ Clearing existing data...')
    await Promise.all([
      StatusUpdate.deleteMany({}),
      Report.deleteMany({}),
      User.deleteMany({}),
      Department.deleteMany({})
    ])

    // Create departments
    console.log('📁 Creating departments...')
    const departmentsData = [
      {
        name: 'Public Works Department',
        code: 'PWD',
        email: 'publicworks@city.gov',
        phone: '+1-555-0101',
        description: 'Roads, infrastructure, and general maintenance'
      },
      {
        name: 'Sanitation Department',
        code: 'SAN',
        email: 'sanitation@city.gov',
        phone: '+1-555-0102',
        description: 'Trash collection and waste management'
      },
      {
        name: 'Electrical Department',
        code: 'ELE',
        email: 'electrical@city.gov',
        phone: '+1-555-0103',
        description: 'Street lights and electrical infrastructure'
      },
      {
        name: 'Parks and Recreation',
        code: 'PAR',
        email: 'parks@city.gov',
        phone: '+1-555-0104',
        description: 'Parks, playgrounds, and recreational facilities'
      },
      {
        name: 'Traffic Management',
        code: 'TRA',
        email: 'traffic@city.gov',
        phone: '+1-555-0105',
        description: 'Traffic signals and road signage'
      },
      {
        name: 'Water Department',
        code: 'WAT',
        email: 'water@city.gov',
        phone: '+1-555-0106',
        description: 'Water supply and leak management'
      },
      {
        name: 'Code Enforcement',
        code: 'COD',
        email: 'enforcement@city.gov',
        phone: '+1-555-0107',
        description: 'Noise complaints and code violations'
      },
      {
        name: 'General Services',
        code: 'GEN',
        email: 'general@city.gov',
        phone: '+1-555-0108',
        description: 'General municipal services and other issues'
      }
    ]

    const departments = await Department.insertMany(departmentsData)
    console.log(`✅ Created ${departments.length} departments`)

    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedAdminPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@city.gov',
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      phone: '+1-555-0100',
      isActive: true
    })

    await adminUser.save()
    console.log(`✅ Admin user created: ${adminUser.email}`)

    // Create department heads
    console.log('👥 Creating department heads...')
    const deptHeadsData = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@city.gov',
        password: await bcrypt.hash('dept123', 12),
        role: UserRole.DEPARTMENT_HEAD,
        phone: '+1-555-0201',
        departmentId: departments.find(d => d.code === 'PWD')?._id
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@city.gov',
        password: await bcrypt.hash('dept123', 12),
        role: UserRole.DEPARTMENT_HEAD,
        phone: '+1-555-0202',
        departmentId: departments.find(d => d.code === 'SAN')?._id
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@city.gov',
        password: await bcrypt.hash('dept123', 12),
        role: UserRole.DEPARTMENT_HEAD,
        phone: '+1-555-0203',
        departmentId: departments.find(d => d.code === 'ELE')?._id
      }
    ]

    const deptHeads = await User.insertMany(deptHeadsData)
    console.log(`✅ Created ${deptHeads.length} department heads`)

    // Create staff members
    console.log('🧑‍💼 Creating staff members...')
    const staffData = [
      {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@city.gov',
        password: await bcrypt.hash('staff123', 12),
        role: UserRole.STAFF,
        phone: '+1-555-0301',
        departmentId: departments.find(d => d.code === 'PWD')?._id
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@city.gov',
        password: await bcrypt.hash('staff123', 12),
        role: UserRole.STAFF,
        phone: '+1-555-0302',
        departmentId: departments.find(d => d.code === 'SAN')?._id
      },
      {
        firstName: 'Carol',
        lastName: 'Martinez',
        email: 'carol.martinez@city.gov',
        password: await bcrypt.hash('staff123', 12),
        role: UserRole.STAFF,
        phone: '+1-555-0303',
        departmentId: departments.find(d => d.code === 'ELE')?._id
      },
      {
        firstName: 'David',
        lastName: 'Garcia',
        email: 'david.garcia@city.gov',
        password: await bcrypt.hash('staff123', 12),
        role: UserRole.STAFF,
        phone: '+1-555-0304',
        departmentId: departments.find(d => d.code === 'PAR')?._id
      },
      {
        firstName: 'Emma',
        lastName: 'Thompson',
        email: 'emma.thompson@city.gov',
        password: await bcrypt.hash('staff123', 12),
        role: UserRole.STAFF,
        phone: '+1-555-0305',
        departmentId: departments.find(d => d.code === 'WAT')?._id
      }
    ]

    const staff = await User.insertMany(staffData)
    console.log(`✅ Created ${staff.length} staff members`)

    // Create sample reports
    console.log('📝 Creating sample reports...')
    const reportsData = [
      {
        title: 'Large pothole on Main Street causing vehicle damage',
        description: 'There is a dangerous pothole near the intersection of Main St and 1st Ave. Multiple vehicles have reported tire damage. The hole is approximately 2 feet wide and 6 inches deep. This is causing traffic delays and poses a safety risk.',
        category: Category.POTHOLE,
        priority: Priority.HIGH,
        status: Status.IN_PROGRESS,
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main Street, Downtown District',
        ward: 'Ward 1',
        citizenName: 'John Doe',
        citizenEmail: 'john.doe@email.com',
        citizenPhone: '+1-555-1001',
        departmentId: departments.find(d => d.code === 'PWD')?._id,
        assignedToId: staff.find(s => s.firstName === 'Alice')?._id,
        imageUrls: [],
        estimatedResolutionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Broken streetlight on Oak Avenue - safety concern',
        description: 'The streetlight at Oak Ave and 2nd St has been out for 5 days. This is a high-traffic pedestrian area and poses safety risks for people walking at night. Several residents have complained.',
        category: Category.STREETLIGHT,
        priority: Priority.MEDIUM,
        status: Status.ACKNOWLEDGED,
        latitude: 40.7589,
        longitude: -73.9851,
        address: '456 Oak Avenue, Midtown District',
        ward: 'Ward 2',
        citizenName: 'Jane Smith',
        citizenEmail: 'jane.smith@email.com',
        citizenPhone: '+1-555-1002',
        departmentId: departments.find(d => d.code === 'ELE')?._id,
        assignedToId: staff.find(s => s.firstName === 'Carol')?._id,
        imageUrls: [],
        estimatedResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        title: 'Overflowing trash bins in Central Park area',
        description: 'Multiple trash bins near the Central Park entrance are overflowing. This has been an ongoing issue for the past week and is attracting pests and creating an unpleasant environment for park visitors.',
        category: Category.TRASH,
        priority: Priority.MEDIUM,
        status: Status.RESOLVED,
        latitude: 40.7829,
        longitude: -73.9654,
        address: 'Central Park Main Entrance, Park District',
        ward: 'Ward 3',
        citizenName: 'Mike Johnson',
        citizenEmail: 'mike.johnson@email.com',
        citizenPhone: '+1-555-1003',
        departmentId: departments.find(d => d.code === 'SAN')?._id,
        assignedToId: staff.find(s => s.firstName === 'Bob')?._id,
        imageUrls: [],
        actualResolutionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        resolutionNotes: 'Additional bins installed and collection frequency increased to twice daily'
      },
      {
        title: 'Emergency: Water leak causing street flooding',
        description: 'Major water leak from underground pipe causing severe flooding on Elm Street. Traffic is being diverted. This appears to be a main water line break and requires immediate attention.',
        category: Category.WATER_LEAK,
        priority: Priority.URGENT,
        status: Status.ASSIGNED,
        latitude: 40.7505,
        longitude: -73.9934,
        address: '789 Elm Street, Uptown District',
        ward: 'Ward 4',
        citizenName: 'Emergency Services',
        citizenEmail: 'emergency@city.gov',
        citizenPhone: '911',
        departmentId: departments.find(d => d.code === 'WAT')?._id,
        assignedToId: staff.find(s => s.firstName === 'Emma')?._id,
        imageUrls: [],
        estimatedResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
      },
      {
        title: 'Graffiti vandalism on municipal building',
        description: 'Large graffiti tag spray-painted on the side of the municipal building facing Main Street. The graffiti is visible from the main road and needs professional cleaning.',
        category: Category.GRAFFITI,
        priority: Priority.LOW,
        status: Status.SUBMITTED,
        latitude: 40.7282,
        longitude: -74.0776,
        address: '100 City Hall Plaza, Government District',
        ward: 'Ward 1',
        citizenName: 'Anonymous Reporter',
        departmentId: departments.find(d => d.code === 'GEN')?._id,
        imageUrls: []
      },
      {
        title: 'Malfunctioning traffic signal at busy intersection',
        description: 'The traffic light at 5th Street and Broadway is stuck on red in all directions, causing traffic congestion during rush hour. Police are directing traffic manually but this needs urgent repair.',
        category: Category.TRAFFIC_SIGNAL,
        priority: Priority.HIGH,
        status: Status.IN_PROGRESS,
        latitude: 40.7505,
        longitude: -73.9856,
        address: '5th Street & Broadway, Commercial District',
        ward: 'Ward 2',
        citizenName: 'Traffic Control Center',
        citizenEmail: 'traffic@city.gov',
        citizenPhone: '+1-555-2000',
        departmentId: departments.find(d => d.code === 'TRA')?._id,
        imageUrls: [],
        estimatedResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ]

    const reports = await Report.insertMany(reportsData)
    console.log(`✅ Created ${reports.length} sample reports`)

    // Create status updates for each report
    console.log('📊 Creating status updates...')
    const statusUpdates = []

    for (const report of reports) {
      // Initial submission update
      statusUpdates.push({
        reportId: report._id,
        oldStatus: Status.SUBMITTED,
        newStatus: Status.SUBMITTED,
        comment: 'Initial report submission',
        updatedById: adminUser._id,
        updateType: 'SYSTEM'
      })

      // Add progression updates based on current status
      if (report.status !== Status.SUBMITTED) {
        statusUpdates.push({
          reportId: report._id,
          oldStatus: Status.SUBMITTED,
          newStatus: Status.ACKNOWLEDGED,
          comment: 'Report acknowledged by department',
          updatedById: deptHeads.find(h => h.departmentId?.toString() === report.departmentId?.toString())?._id || adminUser._id,
          updateType: 'MANUAL'
        })
      }

      if ([Status.ASSIGNED, Status.IN_PROGRESS, Status.RESOLVED].includes(report.status)) {
        statusUpdates.push({
          reportId: report._id,
          oldStatus: Status.ACKNOWLEDGED,
          newStatus: Status.ASSIGNED,
          comment: 'Report assigned to staff member',
          updatedById: deptHeads.find(h => h.departmentId?.toString() === report.departmentId?.toString())?._id || adminUser._id,
          updateType: 'MANUAL'
        })
      }

      if ([Status.IN_PROGRESS, Status.RESOLVED].includes(report.status)) {
        statusUpdates.push({
          reportId: report._id,
          oldStatus: Status.ASSIGNED,
          newStatus: Status.IN_PROGRESS,
          comment: 'Work started on resolving the issue',
          updatedById: report.assignedToId || adminUser._id,
          updateType: 'MANUAL'
        })
      }

      if (report.status === Status.RESOLVED) {
        statusUpdates.push({
          reportId: report._id,
          oldStatus: Status.IN_PROGRESS,
          newStatus: Status.RESOLVED,
          comment: report.resolutionNotes || 'Issue has been resolved',
          updatedById: report.assignedToId || adminUser._id,
          updateType: 'MANUAL'
        })
      }
    }

    await StatusUpdate.insertMany(statusUpdates)
    console.log(`✅ Created ${statusUpdates.length} status updates`)

    console.log('\n🎉 MongoDB seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   • ${departments.length} departments created`)
    console.log(`   • 1 admin user created`)
    console.log(`   • ${deptHeads.length} department heads created`)
    console.log(`   • ${staff.length} staff members created`)
    console.log(`   • ${reports.length} sample reports created`)
    console.log(`   • ${statusUpdates.length} status updates created`)
    
    console.log('\n🔐 Login Credentials:')
    console.log('   Admin: admin@city.gov / admin123')
    console.log('   Dept Head: john.smith@city.gov / dept123')
    console.log('   Staff: alice.brown@city.gov / staff123')
    
    console.log('\n🌐 Database Info:')
    console.log(`   • Database: ${mongoose.connection.db?.databaseName}`)
    console.log(`   • Collections: ${Object.keys(mongoose.connection.collections).join(', ')}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Execute seeding
main()
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })

// Export for use in other scripts if needed
export default main