export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface DatabaseRow {
  [key: string]: unknown
}

export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
}

export interface PaginationParams {
  offset: number
  limit: number
}

export interface SortParams {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface SearchParams extends PaginationParams, SortParams {
  q?: string
  type?: string
}
