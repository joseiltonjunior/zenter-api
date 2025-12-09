import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { TicketRepositoryToken } from '@/domain/tickets/repositories/ticket-repository'

import { CreateTicketUseCase } from '@/domain/tickets/use-cases/create-ticket.use-case'
import { CreateMessageUseCase } from '@/domain/tickets/use-cases/create-message.use-case'

import { CreateTicketController } from '@/infra/http/controllers/tickets/create-ticket.controller'
import { CreateMessageController } from '@/infra/http/controllers/tickets/create-message.controller'

import { PrismaTicketRepository } from '@/infra/database/prisma/prisma-ticket-repository.service'

import { RentalContractRepositoryToken } from '@/domain/RentalContracts/repositories/rental-contract-repository'
import { PropertiesModule } from './properties.module'
import { UsersModule } from './users.module'
import { RentalContractsModule } from './rental-contracts.module'
import { FetchRecentTicketController } from '../controllers/tickets/fetch-recent-tickets.controller'
import { FetchRecentTicketsUseCase } from '@/domain/Tickets/use-cases/fetch-recent-tickets.use-case'

@Module({
  controllers: [
    CreateTicketController,
    CreateMessageController,
    FetchRecentTicketController,
  ],
  providers: [
    PrismaService,

    {
      provide: TicketRepositoryToken,
      useClass: PrismaTicketRepository,
    },

    {
      provide: CreateTicketUseCase,
      useFactory: (ticketsRepo, contractsRepo) =>
        new CreateTicketUseCase(ticketsRepo, contractsRepo),
      inject: [TicketRepositoryToken, RentalContractRepositoryToken],
    },

    {
      provide: CreateMessageUseCase,
      useFactory: (ticketsRepo) => new CreateMessageUseCase(ticketsRepo),
      inject: [TicketRepositoryToken],
    },

    {
      provide: FetchRecentTicketsUseCase,
      useFactory: (ticketsRepo) => new FetchRecentTicketsUseCase(ticketsRepo),
      inject: [TicketRepositoryToken],
    },
  ],
  imports: [PropertiesModule, UsersModule, RentalContractsModule],
  exports: [
    CreateTicketUseCase,
    CreateMessageUseCase,
    FetchRecentTicketsUseCase,
    TicketRepositoryToken,
  ],
})
export class TicketsModule {}
