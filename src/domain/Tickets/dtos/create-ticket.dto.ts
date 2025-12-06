export interface CreateTicketDTO {
  title: string
  description?: string | null
  userId: string
  propertyId?: string | null
  userRole: string
}
