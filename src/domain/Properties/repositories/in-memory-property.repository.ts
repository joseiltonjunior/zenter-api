import { PropertyRepository, CreatePropertyData } from './property-repository'
import { Property } from '../entities/property'
import { v4 as uuidv4 } from 'uuid'

export class InMemoryPropertyRepository implements PropertyRepository {
  properties: Property[] = []

  private activeContracts = new Set<string>()

  async create(data: CreatePropertyData): Promise<Property> {
    const property = new Property(
      uuidv4(),
      data.title,
      data.type,
      'AVAILABLE',
      data.address,
    )
    this.properties.push(property)
    return property
  }

  async findById(id: string): Promise<Property | null> {
    return this.properties.find((i) => i.id === id) ?? null
  }

  async delete(id: string): Promise<void> {
    this.properties = this.properties.filter((i) => i.id !== id)
  }

  async hasActiveContract(id: string): Promise<boolean> {
    return this.activeContracts.has(id)
  }

  async markAsActiveContract(id: string) {
    this.activeContracts.add(id)
  }

  async reserveProperty(
    propertyId: string,
    reservedAt: Date,
    reservedUntil: Date,
  ): Promise<boolean> {
    const property = this.properties.find((p) => p.id === propertyId)

    if (!property) return false
    if (property.status !== 'AVAILABLE') return false

    property.status = 'RESERVED'
    property.reservedAt = reservedAt
    property.reservedUntil = reservedUntil

    return true
  }
}
