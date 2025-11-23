import type { Admin as PrismaAdmin } from "@prisma/client"

// Re-export Prisma types with any necessary extensions
export interface Admin extends Omit<PrismaAdmin, "createdAt" | "lastLogin"> {
  createdAt: Date
  lastLogin?: Date | null
}

// Database row representation (string dates from SQL)
export interface AdminUser extends Omit<PrismaAdmin, "createdAt" | "lastLogin"> {
  createdAt: string
  lastLogin: string | null
}

// Re-export Prisma enum
export { AdminRole } from "@prisma/client"
