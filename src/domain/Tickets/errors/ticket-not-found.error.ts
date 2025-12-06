export class TicketNotFoundError extends Error {
  constructor() {
    super('TICKET_NOT_FOUND')
  }
}
