export class ClosedTicketError extends Error {
  constructor() {
    super('TICKET_ALREADY_CLOSED')
  }
}
