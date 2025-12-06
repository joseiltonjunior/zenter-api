import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { TicketRepositoryToken } from '@/domain/tickets/repositories/ticket-repository'
import { ContractRepositoryToken } from '@/domain/tickets/repositories/contract-repository'

import { CreateTicketUseCase } from '@/domain/tickets/use-cases/create-ticket.use-case'

import { CreateTicketController } from '@/infra/http/controllers/tickets/create-ticket.controller'

import { PrismaTicketRepository } from '@/infra/database/prisma/prisma-ticket-repository.service'
import { PrismaContractRepository } from '@/infra/database/prisma/prisma-contract-repository.service'

@Module({
  controllers: [CreateTicketController],
  providers: [
    PrismaService,

    {
      provide: TicketRepositoryToken,
      useClass: PrismaTicketRepository,
    },

    {
      provide: ContractRepositoryToken,
      useClass: PrismaContractRepository,
    },

    {
      provide: CreateTicketUseCase,
      useFactory: (ticketsRepo, contractsRepo) =>
        new CreateTicketUseCase(ticketsRepo, contractsRepo),
      inject: [TicketRepositoryToken, ContractRepositoryToken],
    },
  ],
  exports: [CreateTicketUseCase],
})
export class TicketsModule {}
