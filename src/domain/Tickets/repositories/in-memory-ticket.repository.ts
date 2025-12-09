import { v4 as uuid } from 'uuid'
import { TicketRepository } from './ticket-repository'
import { Ticket } from '../entities/ticket'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'
import { CreateMessageDTO } from '../dtos/create-message.dto'
import { MessageDTO } from '../dtos/message.dto'
import { FetchRecentTicketsDTO } from '../dtos/fetch-recent-tickets.dto'

export class InMemoryTicketRepository implements TicketRepository {
  public items: Ticket[] = []
  public messages: { ticketId: string; senderId: string; content: string }[] =
    []

  async findByUserAndTitle(userId: string, title: string) {
    return (
      this.items.find((t) => t.userId === userId && t.title === title) ?? null
    )
  }

  async findById(id: string) {
    return this.items.find((t) => t.id === id) ?? null
  }

  async create(data: CreateTicketDTO) {
    const ticket = new Ticket(
      uuid(),
      data.title,
      data.description ?? null,
      'OPEN',
      data.userId,
      data.propertyId ?? null,
      new Date(),
    )

    this.items.push(ticket)
    return ticket
  }

  async createMessage(data: CreateMessageDTO): Promise<void> {
    const message: MessageDTO = {
      id: uuid(),
      ticketId: data.ticketId,
      senderId: data.senderId,
      content: data.content,
      createdAt: new Date(),
    }

    this.messages.push(message)
  }

  async findRecent(params: FetchRecentTicketsDTO) {
    const { page, perPage, isAdmin, userId } = params

    const filtered = isAdmin
      ? this.items
      : this.items.filter((t) => t.userId === userId)

    const total = filtered.length

    const paginated = filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * perPage, page * perPage)

    return {
      tickets: paginated,
      total,
    }
  }
}
