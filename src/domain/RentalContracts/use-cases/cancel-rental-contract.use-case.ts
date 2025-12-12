import { RentalContractRepository } from '../repositories/rental-contract-repository'
import { PropertyRepository } from '@/domain/Properties/repositories/property-repository'
import { UserRepository } from '@/domain/Users/repositories/user-repository'

import { ContractNotFoundError } from '../errors/contract-not-found.error'
import { InvalidContractStatusError } from '../errors/invalid-contract-status.error'
import { OnlyAdminCanCancelContractError } from '../errors/only-admin-can-cancel-contract.error'

export class CancelRentalContractUseCase {
  constructor(
    private contracts: RentalContractRepository,
    private properties: PropertyRepository,
    private users: UserRepository,
  ) {}

  async execute(input: {
    contractId: string
    adminId: string
    reason: string
  }) {
    const admin = await this.users.findById(input.adminId)

    if (!admin || admin.role !== 'ADMIN') {
      throw new OnlyAdminCanCancelContractError()
    }

    const contract = await this.contracts.findById(input.contractId)

    if (!contract) throw new ContractNotFoundError()

    if (!['PENDING', 'ACTIVE'].includes(contract.status)) {
      throw new InvalidContractStatusError()
    }

    await this.properties.markAsAvailable(contract.propertyId)

    const cancelled = await this.contracts.cancel(
      input.contractId,
      input.reason,
    )

    return cancelled
  }
}
