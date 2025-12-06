import { Ticket } from '../entities/ticket'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'
import { CreateMessageDTO } from '../dtos/create-message.dto'

export interface TicketRepository {
  create(data: CreateTicketDTO): Promise<Ticket>
  findByUserAndTitle(userId: string, title: string): Promise<Ticket | null>
  findById(ticketId: string): Promise<Ticket | null>
  createMessage(data: CreateMessageDTO): Promise<void>
}

export const TicketRepositoryToken = Symbol('TicketRepository')
