import { InMemoryPropertyRepository } from '@/domain/properties/repositories/in-memory-property.repository'
import { DeletePropertyUseCase } from '@/domain/properties/use-cases/delete-property.use-case'

import { PropertyHasActiveContractError } from '@/domain/properties/errors/property-has-active-contract.error'
import { PropertyIsOccupiedError } from '@/domain/properties/errors/property-is-occupied.error'
import { PropertyNotFoundError } from '@/domain/properties/errors/property-not-found.error'

describe('DeletePropertyUseCase', () => {
  it('should delete a property successfully', async () => {
    const repo = new InMemoryPropertyRepository()

    const property = await repo.create({
      title: 'Casa A',
      address: 'Rua Teste',
      type: 'HOUSE',
    })

    const useCase = new DeletePropertyUseCase(repo)

    await useCase.execute({ id: property.id })

    expect(repo.items.length).toBe(0)
  })

  it('should throw if property does not exist', async () => {
    const repo = new InMemoryPropertyRepository()
    const useCase = new DeletePropertyUseCase(repo)

    await expect(
      useCase.execute({ id: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(PropertyNotFoundError)
  })

  it('should throw if property has an active contract', async () => {
    const repo = new InMemoryPropertyRepository()

    const property = await repo.create({
      title: 'Casa A',
      address: 'Rua Teste',
      type: 'HOUSE',
    })

    repo.markAsActiveContract(property.id)

    const useCase = new DeletePropertyUseCase(repo)

    await expect(useCase.execute({ id: property.id })).rejects.toBeInstanceOf(
      PropertyHasActiveContractError,
    )
  })

  it('should throw if property is occupied', async () => {
    const repo = new InMemoryPropertyRepository()

    const property = await repo.create({
      title: 'Casa A',
      address: 'Rua Teste',
      type: 'HOUSE',
    })

    property.status = 'OCCUPIED'

    const useCase = new DeletePropertyUseCase(repo)

    await expect(useCase.execute({ id: property.id })).rejects.toBeInstanceOf(
      PropertyIsOccupiedError,
    )
  })
})
