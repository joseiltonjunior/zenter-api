import { InMemoryTicketRepository } from '../repositories/in-memory-ticket.repository'
import { TicketNotFoundError } from '../errors/ticket-not-found.error'

import { Ticket } from '../entities/ticket'
import { v4 as uuid } from 'uuid'
import { CreateMessageUseCase } from './create-message.use-case'
import { MessageNotAllowedError } from '../errors/message-forbidden.error'
import { ClosedTicketError } from '../errors/closed-ticket.error'

describe('CreateMessageUseCase', () => {
  let ticketRepo: InMemoryTicketRepository
  let useCase: CreateMessageUseCase

  beforeEach(() => {
    ticketRepo = new InMemoryTicketRepository()
    useCase = new CreateMessageUseCase(ticketRepo)
  })

  function makeTicket(props?: Partial<Ticket>): Ticket {
    return new Ticket(
      props?.id ?? uuid(),
      props?.title ?? 'Test Ticket',
      props?.description ?? null,
      props?.status ?? 'OPEN',
      props?.userId ?? 'user-1',
      props?.propertyId ?? null,
      props?.createdAt ?? new Date(),
    )
  }

  it('should allow the ticket owner to send a message', async () => {
    const ticket = makeTicket({ userId: 'owner-123' })
    ticketRepo.items.push(ticket)

    await useCase.execute({
      ticketId: ticket.id,
      senderId: 'owner-123',
      senderRole: 'USER',
      content: 'Hello world',
    })

    expect(ticketRepo.messages.length).toBe(1)
    expect(ticketRepo.messages[0].content).toBe('Hello world')
  })

  it('should allow an admin to send a message', async () => {
    const ticket = makeTicket()
    ticketRepo.items.push(ticket)

    await useCase.execute({
      ticketId: ticket.id,
      senderId: 'admin-1',
      senderRole: 'ADMIN',
      content: 'Admin message',
    })

    expect(ticketRepo.messages.length).toBe(1)
  })

  it('should throw if ticket does not exist', async () => {
    await expect(
      useCase.execute({
        ticketId: 'non-existent',
        senderId: 'user-1',
        senderRole: 'USER',
        content: 'Hi',
      }),
    ).rejects.toBeInstanceOf(TicketNotFoundError)
  })

  it('should not allow a different user to send a message', async () => {
    const ticket = makeTicket({ userId: 'owner-123' })
    ticketRepo.items.push(ticket)

    await expect(
      useCase.execute({
        ticketId: ticket.id,
        senderId: 'stranger-999',
        senderRole: 'USER',
        content: 'Trying...',
      }),
    ).rejects.toBeInstanceOf(MessageNotAllowedError)
  })

  it('should not allow messages in a closed ticket', async () => {
    const ticket = makeTicket({ status: 'CLOSED' })
    ticketRepo.items.push(ticket)

    await expect(
      useCase.execute({
        ticketId: ticket.id,
        senderId: ticket.userId,
        senderRole: 'USER',
        content: 'Hello?',
      }),
    ).rejects.toBeInstanceOf(ClosedTicketError)
  })
})
