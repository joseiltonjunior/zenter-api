export class DuplicateTicketError extends Error {
  constructor() {
    super('TICKET_DUPLICATE_TITLE')
  }
}
