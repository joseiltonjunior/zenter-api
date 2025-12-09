import { FetchRecentTicketsUseCase } from './fetch-recent-tickets.use-case'
import { InMemoryTicketRepository } from '../repositories/in-memory-ticket.repository'
import { Ticket } from '../entities/ticket'

describe('FetchRecentTicketsUseCase', () => {
  let repo: InMemoryTicketRepository
  let useCase: FetchRecentTicketsUseCase

  beforeEach(() => {
    repo = new InMemoryTicketRepository()
    useCase = new FetchRecentTicketsUseCase(repo)
  })

  function createTicket(userId: string, createdAt: Date) {
    const ticket = new Ticket(
      crypto.randomUUID(),
      `title-${createdAt.getTime()}`,
      null,
      'OPEN',
      userId,
      null,
      createdAt,
    )
    repo.items.push(ticket)
    return ticket
  }

  it('should return empty list when no tickets exist', async () => {
    const result = await useCase.execute({
      page: 1,
      userId: 'user-1',
      userRole: 'USER',
    })

    expect(result.tickets).toHaveLength(0)
    expect(result.pagination.total).toBe(0)
    expect(result.pagination.totalPages).toBe(0)
  })

  it('should list only tickets from the user when not admin', async () => {
    createTicket('user-1', new Date('2024-01-02'))
    createTicket('user-2', new Date('2024-01-03'))

    const result = await useCase.execute({
      page: 1,
      userId: 'user-1',
      userRole: 'USER',
    })

    expect(result.tickets).toHaveLength(1)
    expect(result.tickets[0].userId).toBe('user-1')
    expect(result.pagination.total).toBe(1)
  })

  it('should list all tickets when admin', async () => {
    createTicket('user-1', new Date('2024-01-02'))
    createTicket('user-2', new Date('2024-01-03'))

    const result = await useCase.execute({
      page: 1,
      userId: 'admin',
      userRole: 'ADMIN',
    })

    expect(result.tickets).toHaveLength(2)
    expect(result.pagination.total).toBe(2)
  })

  it('should apply pagination correctly', async () => {
    for (let i = 1; i <= 25; i++) {
      createTicket(
        'user-1',
        new Date(`2024-01-${i.toString().padStart(2, '0')}`),
      )
    }

    const result = await useCase.execute({
      page: 2,
      userId: 'user-1',
      userRole: 'USER',
    })

    expect(result.tickets).toHaveLength(10) // página 2
    expect(result.pagination.page).toBe(2)
    expect(result.pagination.total).toBe(25)
    expect(result.pagination.totalPages).toBe(3)
    expect(result.pagination.hasNext).toBe(true)
    expect(result.pagination.hasPrev).toBe(true)
  })

  it('should sort tickets by createdAt desc', async () => {
    const t1 = createTicket('user-1', new Date('2024-01-01'))
    const t2 = createTicket('user-1', new Date('2024-01-03'))
    const t3 = createTicket('user-1', new Date('2024-01-02'))

    const result = await useCase.execute({
      page: 1,
      userId: 'user-1',
      userRole: 'USER',
    })

    expect(result.tickets[0].id).toBe(t2.id)
    expect(result.tickets[1].id).toBe(t3.id)
    expect(result.tickets[2].id).toBe(t1.id)
  })
})
