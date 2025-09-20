import { Category, Priority } from '@prisma/client'
import { prisma } from './prisma'

interface RouteDecision {
  departmentId: string
  priority: Priority
  estimatedResolutionDays: number
}

const CATEGORY_DEPARTMENT_MAP: Record<Category, string> = {
  POTHOLE: 'Public Works',
  STREETLIGHT: 'Electrical Department',
  TRASH: 'Sanitation',
  GRAFFITI: 'Parks and Recreation',
  TRAFFIC_SIGNAL: 'Traffic Management',
  WATER_LEAK: 'Water Department',
  NOISE_COMPLAINT: 'Code Enforcement',
  PARK_MAINTENANCE: 'Parks and Recreation',
  OTHER: 'General Services'
}

const PRIORITY_KEYWORDS = {
  URGENT: ['emergency', 'dangerous', 'urgent', 'immediate', 'safety', 'blocked', 'flooding'],
  HIGH: ['broken', 'not working', 'major', 'significant', 'multiple'],
  MEDIUM: ['minor', 'small', 'occasional'],
  LOW: ['cosmetic', 'aesthetic', 'slight']
}

export class RoutingEngine {
  static async routeReport(
    category: Category, 
    description: string, 
    location: { latitude: number; longitude: number }
  ): Promise<RouteDecision> {
    
    // 1. Find appropriate department
    const departmentName = CATEGORY_DEPARTMENT_MAP[category]
    const department = await prisma.department.findUnique({
      where: { name: departmentName }
    })

    if (!department) {
      throw new Error(`Department not found for category: ${category}`)
    }

    // 2. Determine priority based on description keywords
    const priority = this.calculatePriority(description)

    // 3. Estimate resolution time based on category and priority
    const estimatedDays = this.estimateResolutionTime(category, priority)

    return {
      departmentId: department.id,
      priority,
      estimatedResolutionDays: estimatedDays
    }
  }

  private static calculatePriority(description: string): Priority {
    const lowerDesc = description.toLowerCase()
    
    for (const keyword of PRIORITY_KEYWORDS.URGENT) {
      if (lowerDesc.includes(keyword)) return 'URGENT'
    }
    
    for (const keyword of PRIORITY_KEYWORDS.HIGH) {
      if (lowerDesc.includes(keyword)) return 'HIGH'
    }
    
    for (const keyword of PRIORITY_KEYWORDS.LOW) {
      if (lowerDesc.includes(keyword)) return 'LOW'
    }
    
    return 'MEDIUM'
  }

  private static estimateResolutionTime(category: Category, priority: Priority): number {
    const baseTimeMap: Record<Category, number> = {
      POTHOLE: 7,
      STREETLIGHT: 3,
      TRASH: 1,
      GRAFFITI: 5,
      TRAFFIC_SIGNAL: 2,
      WATER_LEAK: 1,
      NOISE_COMPLAINT: 3,
      PARK_MAINTENANCE: 10,
      OTHER: 5
    }

    const priorityMultiplier: Record<Priority, number> = {
      URGENT: 0.25,
      HIGH: 0.5,
      MEDIUM: 1,
      LOW: 2
    }

    return Math.ceil(baseTimeMap[category] * priorityMultiplier[priority])
  }

  // Check for nearby similar reports to prevent duplicates
  static async findNearbyReports(
    latitude: number, 
    longitude: number, 
    radiusMeters: number = 100,
    category: Category
  ) {
    // Simple distance calculation (not perfect for production but good for MVP)
    const latRange = radiusMeters / 111320 // rough conversion
    const longRange = radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180))

    return await prisma.report.findMany({
      where: {
        category,
        latitude: {
          gte: latitude - latRange,
          lte: latitude + latRange
        },
        longitude: {
          gte: longitude - longRange,
          lte: longitude + longRange
        },
        status: {
          not: 'CLOSED'
        }
      }
    })
  }
}