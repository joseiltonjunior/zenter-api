import { TicketRepository } from '../repositories/ticket-repository'
import { CreateMessageDTO } from '../dtos/create-message.dto'
import { TicketNotFoundError } from '../errors/ticket-not-found.error'

import { ClosedTicketError } from '../errors/closed-ticket.error'
import { MessageNotAllowedError } from '../errors/message-forbidden.error'

export class CreateMessageUseCase {
  constructor(private tickets: TicketRepository) {}

  async execute(input: CreateMessageDTO) {
    const ticket = await this.tickets.findById(input.ticketId)

    if (!ticket) {
      throw new TicketNotFoundError()
    }

    const isOwner = ticket.userId === input.senderId
    const isAdmin = input.senderRole === 'ADMIN'

    if (!isOwner && !isAdmin) {
      throw new MessageNotAllowedError()
    }

    if (ticket.status === 'CLOSED') {
      throw new ClosedTicketError()
    }

    await this.tickets.createMessage({
      ticketId: input.ticketId,
      senderId: input.senderId,
      content: input.content,
      senderRole: input.senderId,
    })
  }
}
