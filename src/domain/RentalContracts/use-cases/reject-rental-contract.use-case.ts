import { RentalContractRepository } from '../repositories/rental-contract-repository'
import { PropertyRepository } from '@/domain/Properties/repositories/property-repository'
import { UserRepository } from '@/domain/Users/repositories/user-repository'

import { ContractNotFoundError } from '../errors/contract-not-found.error'
import { InvalidContractStatusError } from '../errors/invalid-contract-status.error'
import { OnlyAdminCanRejectContractError } from '../errors/only-admin-can-reject-contract.error'

export class RejectRentalContractUseCase {
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
      throw new OnlyAdminCanRejectContractError()
    }

    const contract = await this.contracts.findById(input.contractId)

    if (!contract) {
      throw new ContractNotFoundError()
    }

    if (contract.status !== 'PENDING') {
      throw new InvalidContractStatusError()
    }

    await this.properties.markAsAvailable(contract.propertyId)

    const rejected = await this.contracts.reject(input.contractId, input.reason)

    return rejected
  }
}
