import { Ticket } from '../entities/ticket'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'

export interface TicketRepository {
  create(data: CreateTicketDTO): Promise<Ticket>
  findByUserAndTitle(userId: string, title: string): Promise<Ticket | null>
}

export const TicketRepositoryToken = Symbol('TicketRepository')
