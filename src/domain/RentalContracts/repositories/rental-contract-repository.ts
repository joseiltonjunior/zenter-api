import { CreateRentalContractDTO } from '../dtos/create-rental-contract.dto'
import { RentalContract } from '../entities/rental-contract'

export interface RentalContractRepository {
  create(data: CreateRentalContractDTO): Promise<RentalContract>
  userHasActiveContract(userId: string, propertyId: string): Promise<boolean>
}

export const RentalContractRepositoryToken = Symbol('RentalContractRepository')
