import { describe, it, expect, beforeEach } from 'vitest'

import { InMemoryRentalContractRepository } from '../repositories/in-memory-rental-contract.repository'
import { InMemoryPropertyRepository } from '@/domain/Properties/repositories/in-memory-property.repository'
import { InMemoryUserRepository } from '@/domain/Users/repositories/in-memory-user.repository'

import { OnlyAdminCanActivateContractError } from '../errors/only-admin-can-activate-contract.error'
import { ContractNotFoundError } from '../errors/contract-not-found.error'
import { InvalidContractStatusError } from '../errors/invalid-contract-status.error'

import { User } from '@/domain/Users/entities/user'
import { Property } from '@/domain/Properties/entities/property'
import { RentalContract } from '../entities/rental-contract'
import { ActivateRentalContractUseCase } from './activate-rental-contract.use-case'

describe('ActivateRentalContractUseCase', () => {
  let contractsRepo: InMemoryRentalContractRepository
  let propertiesRepo: InMemoryPropertyRepository
  let usersRepo: InMemoryUserRepository
  let useCase: ActivateRentalContractUseCase

  let admin: User
  let tenant: User
  let property: Property
  let contract: RentalContract

  beforeEach(async () => {
    contractsRepo = new InMemoryRentalContractRepository()
    propertiesRepo = new InMemoryPropertyRepository()
    usersRepo = new InMemoryUserRepository()

    useCase = new ActivateRentalContractUseCase(
      contractsRepo,
      propertiesRepo,
      usersRepo,
    )

    // cria tenant
    tenant = await usersRepo.create({
      name: 'John Tenant',
      email: 'tenant@test.com',
      password: '123456',
    })

    // cria admin
    admin = await usersRepo.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN',
    })

    // cria propriedade
    property = await propertiesRepo.create({
      title: 'Casa Teste',
      address: 'Rua XPTO',
      type: 'HOUSE',
    })

    // cria contrato PENDING
    contract = await contractsRepo.create({
      propertyId: property.id,
      userId: tenant.id,
      adminId: admin.id,
      initialContract: new Date(),
      endContract: new Date(Date.now() + 86400000 * 30),
    })
  })

  it('should activate a pending contract when admin is valid', async () => {
    const result = await useCase.execute({
      contractId: contract.id,
      adminId: admin.id,
    })

    // contrato deve ter status ACTIVE
    expect(result).toBeDefined()
    expect(result!.status).toBe('ACTIVE')

    // propriedade deve ser marcada como OCCUPIED
    const updatedProperty = await propertiesRepo.findById(property.id)
    expect(updatedProperty!.status).toBe('OCCUPIED')
  })

  it('should throw if user is not admin', async () => {
    await expect(
      useCase.execute({
        contractId: contract.id,
        adminId: tenant.id, // tenant não é admin
      }),
    ).rejects.toBeInstanceOf(OnlyAdminCanActivateContractError)
  })

  it('should throw if contract does not exist', async () => {
    await expect(
      useCase.execute({
        contractId: 'non-existent',
        adminId: admin.id,
      }),
    ).rejects.toBeInstanceOf(ContractNotFoundError)
  })

  it('should throw if contract status is not PENDING', async () => {
    // forçando contrato a estar ACTIVE
    const found = await contractsRepo.findById(contract.id)
    if (found) found.status = 'ACTIVE'

    await expect(
      useCase.execute({
        contractId: contract.id,
        adminId: admin.id,
      }),
    ).rejects.toBeInstanceOf(InvalidContractStatusError)
  })

  it('should mark property as occupied before calling activate', async () => {
    let markCalled = false
    let activateCalled = false

    propertiesRepo.markAsOccupied = async () => {
      markCalled = true
    }

    contractsRepo.activate = async () => {
      activateCalled = true
      expect(markCalled).toBe(true)

      return new RentalContract(
        contract.id,
        contract.userId,
        contract.propertyId,
        contract.adminId,
        contract.initialContract,
        contract.endContract,
        'ACTIVE',
        contract.createdAt,
        new Date(),
        null,
        null,
        null,
        null,
        null,
      )
    }

    await useCase.execute({
      contractId: contract.id,
      adminId: admin.id,
    })

    expect(markCalled).toBe(true)
    expect(activateCalled).toBe(true)
  })
})
