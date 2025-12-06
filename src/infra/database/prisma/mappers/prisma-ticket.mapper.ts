import { Ticket } from '@/domain/tickets/entities/ticket'
import { Ticket as PrismaTicket } from '@prisma/client'

export class PrismaTicketMapper {
  static toDomain(raw: PrismaTicket): Ticket {
    return new Ticket(
      raw.id,
      raw.title,
      raw.description ?? null,
      raw.status,
      raw.userId,
      raw.propertyId ?? null,
      raw.createdAt,
    )
  }

  static toPrisma(entity: Ticket) {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      userId: entity.userId,
      propertyId: entity.propertyId,
      createdAt: entity.createdAt,
    }
  }
}
