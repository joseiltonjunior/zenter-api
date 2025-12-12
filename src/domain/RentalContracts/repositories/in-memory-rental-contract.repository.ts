import { randomUUID } from 'node:crypto'
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
      randomUUID(),
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

  async findById(id: string) {
    return this.items.find((t) => t.id === id) ?? null
  }

  async activate(id: string) {
    const contract = this.items.find((c) => c.id === id)
    if (!contract) return null

    if (contract.status !== 'PENDING') return null

    contract.status = 'ACTIVE'
    contract.activatedAt = new Date()

    return contract
  }

  async userHasActiveContract(userId: string, propertyId: string) {
    return this.items.some(
      (c) =>
        c.userId === userId &&
        c.propertyId === propertyId &&
        c.status === 'ACTIVE',
    )
  }

  async cancel(id: string, reason: string): Promise<RentalContract | null> {
    const contract = this.items.find((c) => c.id === id)
    if (!contract) return null

    if (!['PENDING', 'ACTIVE'].includes(contract.status)) return null

    contract.status = 'CANCELED'
    contract.cancelledAt = new Date()
    contract.cancelReason = reason

    return contract
  }

  async reject(id: string, reason: string): Promise<RentalContract | null> {
    const contract = this.items.find((c) => c.id === id)
    if (!contract) return null

    if (contract.status !== 'PENDING') return null

    contract.status = 'REJECTED'
    contract.rejectedAt = new Date()
    contract.rejectedReason = reason

    return contract
  }
}
