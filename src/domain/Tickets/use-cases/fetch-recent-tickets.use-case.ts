import { TicketRepository } from '../repositories/ticket-repository'

export class FetchRecentTicketsUseCase {
  constructor(private tickets: TicketRepository) {}

  async execute(input: { page: number; userId: string; userRole: string }) {
    const perPage = 10

    const { tickets, total } = await this.tickets.findRecent({
      page: input.page,
      perPage,
      isAdmin: input.userRole === 'ADMIN',
      userId: input.userRole === 'ADMIN' ? undefined : input.userId,
    })

    const totalPages = Math.ceil(total / perPage)

    return {
      tickets,
      pagination: {
        page: input.page,
        perPage,
        total,
        totalPages,
        hasNext: input.page < totalPages,
        hasPrev: input.page > 1,
      },
    }
  }
}
