import { PropertyRepository, CreatePropertyProps } from './property-repository'
import { Property } from '../entities/property'
import { v4 as uuidv4 } from 'uuid'

export class InMemoryPropertyRepository implements PropertyRepository {
  items: Property[] = []

  private activeContracts = new Set<string>()

  async create(data: CreatePropertyProps): Promise<Property> {
    const p = new Property(
      uuidv4(),
      data.title,
      data.type,
      'AVAILABLE',
      data.address,
    )
    this.items.push(p)
    return p
  }

  async findById(id: string): Promise<Property | null> {
    return this.items.find((i) => i.id === id) ?? null
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id)
  }

  async hasActiveContract(id: string): Promise<boolean> {
    return this.activeContracts.has(id)
  }

  markAsActiveContract(id: string) {
    this.activeContracts.add(id)
  }
}
