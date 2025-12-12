import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

import { PrismaTicketMapper } from './mappers/prisma-ticket.mapper'

import { CreateMessageDTO } from '@/domain/Tickets/dtos/create-message.dto'
import { FetchRecentTicketsDTO } from '@/domain/Tickets/dtos/fetch-recent-tickets.dto'
import { TicketRepository } from '@/domain/Tickets/repositories/ticket-repository'
import { CreateTicketDTO } from '@/domain/Tickets/dtos/create-ticket.dto'

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

  async findRecent(params: FetchRecentTicketsDTO) {
    const { page, perPage, isAdmin, userId } = params

    const where = isAdmin ? {} : { userId }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        take: perPage,
        skip: (page - 1) * perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ])

    return { tickets, total }
  }
}
