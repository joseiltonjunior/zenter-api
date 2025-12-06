import { PropertyType } from '../dtos/create-property.dto'
import { Property } from '../entities/property'

export interface CreatePropertyData {
  title: string
  type: PropertyType
  address: string
}

export interface PropertyRepository {
  create(data: CreatePropertyData): Promise<Property>
  delete(id: string): Promise<void>
  hasActiveContract(id: string): Promise<boolean>
  findById(id: string): Promise<Property | null>
}

export const PropertyRepositoryToken = Symbol('PropertyRepository')
