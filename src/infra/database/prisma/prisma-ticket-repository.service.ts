import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { TicketRepository } from '@/domain/tickets/repositories/ticket-repository'
import { PrismaTicketMapper } from './mappers/prisma-ticket.mapper'
import { CreateTicketDTO } from '@/domain/tickets/dtos/create-ticket.dto'
import { CreateMessageDTO } from '@/domain/Tickets/dtos/create-message.dto'

@Injectable()
export class PrismaTicketRepository implements TicketRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserAndTitle(userId: string, title: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { userId_title: { userId, title } },
    })
    return ticket ? PrismaTicketMapper.toDomain(ticket) : null
  }

  async create(data: CreateTicketDTO) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        userId: data.userId,
        propertyId: data.propertyId ?? null,
      },
    })

    return PrismaTicketMapper.toDomain(ticket)
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    })

    return ticket ? PrismaTicketMapper.toDomain(ticket) : null
  }

  async createMessage(data: CreateMessageDTO) {
    await this.prisma.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: data.senderId,
        content: data.content,
      },
    })
  }
}
