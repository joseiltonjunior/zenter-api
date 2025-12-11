import { CreateRentalContractDTO } from '../dtos/create-rental-contract.dto'
import { RentalContract } from '../entities/rental-contract'

export interface RentalContractRepository {
  create(data: CreateRentalContractDTO): Promise<RentalContract>
  findById(ticketId: string): Promise<RentalContract | null>
  userHasActiveContract(userId: string, propertyId: string): Promise<boolean>
  activate(contractId: string): Promise<RentalContract | null>
}

export const RentalContractRepositoryToken = Symbol('RentalContractRepository')
