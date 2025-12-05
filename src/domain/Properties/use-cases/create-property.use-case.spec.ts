import { InMemoryPropertyRepository } from '@/domain/properties/repositories/in-memory-property.repository'
import { CreatePropertyUseCase } from '@/domain/properties/use-cases/create-property.use-case'

describe('CreatePropertyUseCase', () => {
  it('should create a property', async () => {
    const repo = new InMemoryPropertyRepository()
    const useCase = new CreatePropertyUseCase(repo)

    const result = await useCase.execute({
      title: 'Casa A',
      address: 'Rua X',
      type: 'HOUSE',
    })

    expect(result.id).toBeDefined()
    expect(result.title).toBe('Casa A')
    expect(repo.items.length).toBe(1)
  })
})
