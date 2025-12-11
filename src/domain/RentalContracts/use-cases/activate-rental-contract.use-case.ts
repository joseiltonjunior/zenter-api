import { RentalContractRepository } from '../repositories/rental-contract-repository'
import { PropertyRepository } from '@/domain/Properties/repositories/property-repository'
import { UserRepository } from '@/domain/Users/repositories/user-repository'
import { OnlyAdminCanActivateContractError } from '../errors/only-admin-can-activate-contract.error'
import { ContractNotFoundError } from '../errors/contract-not-found.error'
import { InvalidContractStatusError } from '../errors/invalid-contract-status.error'

export class ActivateRentalContractUseCase {
  constructor(
    private contracts: RentalContractRepository,
    private properties: PropertyRepository,
    private users: UserRepository,
  ) {}

  async execute(input: { contractId: string; adminId: string }) {
    const admin = await this.users.findById(input.adminId)

    if (!admin || admin.role !== 'ADMIN') {
      throw new OnlyAdminCanActivateContractError()
    }

    const contract = await this.contracts.findById(input.contractId)

    if (!contract) throw new ContractNotFoundError()

    if (contract.status !== 'PENDING') {
      throw new InvalidContractStatusError()
    }

    await this.properties.markAsOccupied(contract.propertyId)

    const activated = await this.contracts.activate(input.contractId)

    return activated
  }
}
