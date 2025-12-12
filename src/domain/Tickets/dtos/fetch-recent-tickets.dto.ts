export interface FetchRecentTicketsDTO {
  page: number
  perPage: number
  userId?: string
  isAdmin: boolean
}
