import { v4 as uuid } from 'uuid'
import { TicketRepository } from './ticket-repository'
import { Ticket } from '../entities/ticket'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'

export class InMemoryTicketRepository implements TicketRepository {
  public items: Ticket[] = []

  async findByUserAndTitle(userId: string, title: string) {
    return (
      this.items.find((t) => t.userId === userId && t.title === title) ?? null
    )
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
}
