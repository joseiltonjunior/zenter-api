import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'

import { RejectRentalContractUseCase } from './reject-rental-contract.use-case'
import { InMemoryRentalContractRepository } from '../repositories/in-memory-rental-contract.repository'
import { InMemoryPropertyRepository } from '@/domain/Properties/repositories/in-memory-property.repository'
import { InMemoryUserRepository } from '@/domain/Users/repositories/in-memory-user.repository'

import { User } from '@/domain/Users/entities/user'
import { Property } from '@/domain/Properties/entities/property'
import { RentalContract } from '../entities/rental-contract'

import { OnlyAdminCanRejectContractError } from '../errors/only-admin-can-reject-contract.error'
import { ContractNotFoundError } from '../errors/contract-not-found.error'
import { InvalidContractStatusError } from '../errors/invalid-contract-status.error'

describe('RejectRentalContractUseCase', () => {
  let contractsRepo: InMemoryRentalContractRepository
  let propertiesRepo: InMemoryPropertyRepository
  let usersRepo: InMemoryUserRepository
  let useCase: RejectRentalContractUseCase

  let admin: User
  let tenant: User
  let property: Property
  let contract: RentalContract

  beforeEach(async () => {
    contractsRepo = new InMemoryRentalContractRepository()
    propertiesRepo = new InMemoryPropertyRepository()
    usersRepo = new InMemoryUserRepository()

    useCase = new RejectRentalContractUseCase(
      contractsRepo,
      propertiesRepo,
      usersRepo,
    )

    tenant = await usersRepo.create({
      name: 'Tenant',
      email: 'tenant@test.com',
      password: '123456',
    })

    admin = await usersRepo.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN',
    })

    property = await propertiesRepo.create({
      title: 'Casa Teste',
      address: 'Rua X',
      type: 'HOUSE',
    })

    contract = await contractsRepo.create({
      initialContract: new Date(),
      endContract: new Date(Date.now() + 86400000),
      userId: tenant.id,
      propertyId: property.id,
      adminId: admin.id,
    })
  })

  it('should reject a PENDING contract', async () => {
    property.status = 'RESERVED'

    const result = await useCase.execute({
      contractId: contract.id,
      adminId: admin.id,
      reason: 'Invalid documentation',
    })

    expect(result?.status).toBe('REJECTED')
    expect(result?.rejectedReason).toBe('Invalid documentation')
    expect(result?.rejectedAt).toBeInstanceOf(Date)

    const updatedProperty = await propertiesRepo.findById(property.id)
    expect(updatedProperty!.status).toBe('AVAILABLE')
  })

  it('should throw if user is not admin', async () => {
    const user = await usersRepo.create({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    })

    await expect(
      useCase.execute({
        contractId: contract.id,
        adminId: user.id,
        reason: 'Invalid',
      }),
    ).rejects.toBeInstanceOf(OnlyAdminCanRejectContractError)
  })

  it('should throw if contract does not exist', async () => {
    await expect(
      useCase.execute({
        contractId: randomUUID(),
        adminId: admin.id,
        reason: 'Whatever',
      }),
    ).rejects.toBeInstanceOf(ContractNotFoundError)
  })

  it('should throw if contract status cannot be rejected', async () => {
    contract.status = 'ACTIVE'

    await expect(
      useCase.execute({
        contractId: contract.id,
        adminId: admin.id,
        reason: 'Invalid state',
      }),
    ).rejects.toBeInstanceOf(InvalidContractStatusError)
  })
})
