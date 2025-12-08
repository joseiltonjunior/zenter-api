import { CreateRentalContractDTO } from '../dtos/create-rental-contract.dto'

import { InvalidContractDatesError } from '../errors/invalid-contract-dates.error'
import { PropertyNotAvailableError } from '../errors/property-not-available.error'
import { TenantNotFoundError } from '../errors/tenant-not-found.error'
import { OnlyAdminCanCreateContractError } from '../errors/only-admin-can-create-contract.error'
import { UserRepository } from '@/domain/Users/repositories/user-repository'
import { RentalContractRepository } from '../repositories/rental-contract-repository'
import { PropertyRepository } from '@/domain/Properties/repositories/property-repository'

export class CreateRentalContractUseCase {
  constructor(
    private contracts: RentalContractRepository,
    private properties: PropertyRepository,
    private users: UserRepository,
  ) {}

  async execute(input: CreateRentalContractDTO) {
    const admin = await this.users.findById(input.adminId)

    if (!admin || admin.role !== 'ADMIN') {
      throw new OnlyAdminCanCreateContractError()
    }

    if (input.initialContract >= input.endContract) {
      throw new InvalidContractDatesError()
    }

    const tenant = await this.users.findById(input.userId)
    if (!tenant) throw new TenantNotFoundError()

    const reserved = await this.properties.reserveProperty(
      input.propertyId,
      new Date(),
      input.initialContract,
    )

    if (!reserved) {
      throw new PropertyNotAvailableError()
    }

    return this.contracts.create({
      initialContract: input.initialContract,
      endContract: input.endContract,
      adminId: input.adminId,
      propertyId: input.propertyId,
      userId: input.userId,
    })
  }
}
