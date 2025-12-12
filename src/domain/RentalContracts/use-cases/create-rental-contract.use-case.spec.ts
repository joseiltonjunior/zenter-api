import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'

import { CreateRentalContractUseCase } from './create-rental-contract.use-case'
import { InMemoryRentalContractRepository } from '../repositories/in-memory-rental-contract.repository'
import { InMemoryPropertyRepository } from '@/domain/Properties/repositories/in-memory-property.repository'
import { TenantNotFoundError } from '../errors/tenant-not-found.error'
import { CreateRentalContractDTO } from '../dtos/create-rental-contract.dto'
import { PropertyNotAvailableError } from '../errors/property-not-available.error'
import { InvalidContractDatesError } from '../errors/invalid-contract-dates.error'
import { OnlyAdminCanCreateContractError } from '../errors/only-admin-can-create-contract.error'
import { InMemoryUserRepository } from '@/domain/Users/repositories/in-memory-user.repository'
import { User } from '@/domain/Users/entities/user'
import { Property } from '@/domain/Properties/entities/property'

describe('CreateRentalContractUseCase', () => {
  let contractsRepo: InMemoryRentalContractRepository
  let propertiesRepo: InMemoryPropertyRepository
  let usersRepo: InMemoryUserRepository
  let useCase: CreateRentalContractUseCase
  let admin: User
  let tenant: User
  let property: Property

  beforeEach(async () => {
    contractsRepo = new InMemoryRentalContractRepository()
    propertiesRepo = new InMemoryPropertyRepository()
    usersRepo = new InMemoryUserRepository()

    useCase = new CreateRentalContractUseCase(
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
  })

  it('should create a contract when admin, user exists and property available', async () => {
    const initial = new Date(Date.now() + 86400000)
    const end = new Date(Date.now() + 86400000 * 30)

    const input: CreateRentalContractDTO = {
      initialContract: initial,
      endContract: end,
      propertyId: property.id,
      userId: tenant.id,
      adminId: admin.id,
    }

    const contract = await useCase.execute(input)

    expect(contract).toBeDefined()
    expect(contract.propertyId).toBe(property.id)
    expect(contract.userId).toBe(tenant.id)
    expect(contract.status).toBe('PENDING')

    const updated = await propertiesRepo.findById(property.id)
    expect(updated!.status).toBe('RESERVED')
    expect(updated!.reservedUntil).toEqual(initial)
  })

  it('should throw if user is not admin', async () => {
    const input: CreateRentalContractDTO = {
      initialContract: new Date(),
      endContract: new Date(Date.now() + 86400000),
      propertyId: property.id,
      userId: tenant.id,
      adminId: randomUUID(),
    }

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      OnlyAdminCanCreateContractError,
    )
  })

  it('should throw if dates are invalid', async () => {
    const now = new Date()

    const input: CreateRentalContractDTO = {
      initialContract: now,
      endContract: now,
      propertyId: property.id,
      userId: tenant.id,
      adminId: admin.id,
    }

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      InvalidContractDatesError,
    )
  })

  it('should throw if user does not exist', async () => {
    const input: CreateRentalContractDTO = {
      initialContract: new Date(),
      endContract: new Date(Date.now() + 86400000),
      propertyId: property.id,
      userId: randomUUID(),
      adminId: admin.id,
    }

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      TenantNotFoundError,
    )
  })

  it('should throw if property is unavailable', async () => {
    const p = await propertiesRepo.findById(property.id)
    if (p) p.status = 'OCCUPIED'

    const input: CreateRentalContractDTO = {
      initialContract: new Date(),
      endContract: new Date(Date.now() + 86400000),
      propertyId: property.id,
      userId: tenant.id,
      adminId: admin.id,
    }

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      PropertyNotAvailableError,
    )
  })
})
