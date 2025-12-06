export class ForbiddenToOpenTicketError extends Error {
  constructor() {
    super('USER_CANNOT_OPEN_TICKET_FOR_THIS_PROPERTY')
  }
}
