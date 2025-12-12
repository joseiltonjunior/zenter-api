import { CreateTicketUseCase } from './create-ticket.use-case'

import { ForbiddenToOpenTicketError } from '../errors/forbidden-to-open-ticket.error'
import { DuplicateTicketError } from '../errors/duplicate-ticket.error'
import { InMemoryTicketRepository } from '../repositories/in-memory-ticket.repository'
import { InMemoryRentalContractRepository } from '@/domain/RentalContracts/repositories/in-memory-rental-contract.repository'
import { RentalContract } from '@/domain/RentalContracts/entities/rental-contract'

describe('CreateTicketUseCase', () => {
  let ticketRepo: InMemoryTicketRepository
  let contractRepo: InMemoryRentalContractRepository
  let useCase: CreateTicketUseCase

  beforeEach(() => {
    ticketRepo = new InMemoryTicketRepository()
    contractRepo = new InMemoryRentalContractRepository()
    useCase = new CreateTicketUseCase(ticketRepo, contractRepo)
  })

  it('should create a ticket', async () => {
    const ticket = await useCase.execute({
      title: 'My Ticket',
      description: 'Something broke',
      userId: 'user-1',
      userRole: 'USER',
      propertyId: null,
    })

    expect(ticket.id).toBeDefined()
    expect(ticket.title).toBe('My Ticket')
    expect(ticketRepo.items.length).toBe(1)
  })

  it('should not allow a non-admin to create ticket for property without contract', async () => {
    await expect(
      useCase.execute({
        title: 'Issue',
        description: 'Help',
        userId: 'user-1',
        userRole: 'USER',
        propertyId: 'property-123',
      }),
    ).rejects.toBeInstanceOf(ForbiddenToOpenTicketError)
  })

  it('should allow admin to open ticket even without contract', async () => {
    const ticket = await useCase.execute({
      title: 'Admin Issue',
      description: null,
      userId: 'admin-1',
      userRole: 'ADMIN',
      propertyId: 'property-123',
    })

    expect(ticketRepo.items.length).toBe(1)
    expect(ticket.title).toBe('Admin Issue')
  })

  it('should not allow duplicate title for same user', async () => {
    await useCase.execute({
      title: 'Duplicated',
      description: 'Test',
      userId: 'user-1',
      userRole: 'USER',
      propertyId: null,
    })

    await expect(
      useCase.execute({
        title: 'Duplicated',
        description: 'Test again',
        userId: 'user-1',
        userRole: 'USER',
        propertyId: null,
      }),
    ).rejects.toBeInstanceOf(DuplicateTicketError)
  })

  it('should allow user to open ticket for property with active contract', async () => {
    // Criando contrato PENDING no repositório de contratos
    const activeContract = new RentalContract(
      'contract-1',
      'user-1',
      'property-1',
      'admin-1',
      new Date(),
      new Date(Date.now() + 86400000 * 30),
      'ACTIVE',
      new Date(),
      new Date(), // activatedAt
    )

    contractRepo.items.push(activeContract)

    const ticket = await useCase.execute({
      title: 'Sink broken',
      description: 'urgent',
      userId: 'user-1',
      userRole: 'USER',
      propertyId: 'property-1',
    })

    expect(ticketRepo.items.length).toBe(1)
    expect(ticket.title).toBe('Sink broken')
  })
})
