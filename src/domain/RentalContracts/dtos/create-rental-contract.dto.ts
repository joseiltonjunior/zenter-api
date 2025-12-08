export interface CreateRentalContractDTO {
  initialContract: Date
  endContract: Date
  propertyId: string
  userId: string
  adminId: string
}
