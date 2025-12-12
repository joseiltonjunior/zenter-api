import { Property } from '@/domain/Properties/entities/property'
import { Property as PrismaProperty } from '@prisma/client'

export class PrismaPropertyMapper {
  static toDomain(raw: PrismaProperty): Property {
    return new Property(
      raw.id,
      raw.title,
      raw.type,
      raw.status,
      raw.address,
      raw.reservedAt,
      raw.reservedUntil,
      raw.createdAt,
    )
  }

  static toPrisma(entity: Property) {
    return {
      id: entity.id,
      title: entity.title,
      type: entity.type,
      status: entity.status,
      address: entity.address,
      reservedAt: entity.reservedAt,
      reservedUntil: entity.reservedUntil,
      createdAt: entity.createdAt,
    }
  }
}
