import { Ticket } from '../entities/ticket'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'
import { CreateMessageDTO } from '../dtos/create-message.dto'
import { FetchRecentTicketsDTO } from '../dtos/fetch-recent-tickets.dto'

export interface TicketRepository {
  create(data: CreateTicketDTO): Promise<Ticket>
  findByUserAndTitle(userId: string, title: string): Promise<Ticket | null>
  findById(ticketId: string): Promise<Ticket | null>
  createMessage(data: CreateMessageDTO): Promise<void>
  findRecent(params: FetchRecentTicketsDTO): Promise<{
    tickets: Ticket[]
    total: number
  }>
}

export const TicketRepositoryToken = Symbol('TicketRepository')
