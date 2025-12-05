import { PropertyType } from '@prisma/client'

export interface CreatePropertyDTO {
  title: string
  type: PropertyType
  address: string
}
