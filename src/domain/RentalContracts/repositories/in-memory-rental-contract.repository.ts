import { v4 as uuid } from 'uuid'
import { RentalContractRepository } from './rental-contract-repository'
import { RentalContract } from '../entities/rental-contract'
import { CreateRentalContractDTO } from '../dtos/create-rental-contract.dto'

export class InMemoryRentalContractRepository
  implements RentalContractRepository
{
  public items: RentalContract[] = []
  private activeContracts = new Set<string>()

  async create(data: CreateRentalContractDTO): Promise<RentalContract> {
    const contract = new RentalContract(
      uuid(),
      data.userId,
      data.propertyId,
      data.adminId,
      data.initialContract,
      data.endContract,
      'PENDING',
      new Date(),
      null, // activatedAt
      null, // cancelledAt
      null, // rejectedAt
      null, // expiredAt
      null, // cancelReason
      null, // rejectedReason
    )

    this.items.push(contract)

    return contract
  }

  async markActive(userId: string, propertyId: string) {
    this.activeContracts.add(`${userId}:${propertyId}`)
  }

  async userHasActiveContract(userId: string, propertyId: string) {
    return this.activeContracts.has(`${userId}:${propertyId}`)
  }
}
