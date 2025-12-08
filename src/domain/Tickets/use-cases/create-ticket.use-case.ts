import { TicketRepository } from '../repositories/ticket-repository'

import { ForbiddenToOpenTicketError } from '../errors/forbidden-to-open-ticket.error'
import { DuplicateTicketError } from '../errors/duplicate-ticket.error'
import { CreateTicketDTO } from '../dtos/create-ticket.dto'
import { RentalContractRepository } from '@/domain/RentalContracts/repositories/rental-contract-repository'

export class CreateTicketUseCase {
  constructor(
    private tickets: TicketRepository,
    private contracts: RentalContractRepository,
  ) {}

  async execute(input: CreateTicketDTO) {
    if (input.propertyId && input.userRole !== 'ADMIN') {
      const hasContract = await this.contracts.userHasActiveContract(
        input.userId,
        input.propertyId,
      )

      if (!hasContract) {
        throw new ForbiddenToOpenTicketError()
      }
    }

    const alreadyExists = await this.tickets.findByUserAndTitle(
      input.userId,
      input.title,
    )

    if (alreadyExists) {
      throw new DuplicateTicketError()
    }

    return this.tickets.create(input)
  }
}
