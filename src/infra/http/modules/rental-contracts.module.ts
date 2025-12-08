import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { PropertyRepositoryToken } from '@/domain/Properties/repositories/property-repository'
import { UserRepositoryToken } from '@/domain/Users/repositories/user-repository'

import { PrismaRentalContractRepository } from '@/infra/database/prisma/prisma-rental-contract-repository.service'

import { CreateContractController } from '@/infra/http/controllers/rentalContracts/create-contract.controller'
import { RentalContractRepositoryToken } from '@/domain/RentalContracts/repositories/rental-contract-repository'
import { CreateRentalContractUseCase } from '@/domain/RentalContracts/use-cases/create-rental-contract.use-case'
import { PropertiesModule } from './properties.module'
import { UsersModule } from './users.module'

@Module({
  controllers: [CreateContractController],
  providers: [
    PrismaService,

    {
      provide: RentalContractRepositoryToken,
      useClass: PrismaRentalContractRepository,
    },

    {
      provide: CreateRentalContractUseCase,
      useFactory: (contracts, properties, users) =>
        new CreateRentalContractUseCase(contracts, properties, users),
      inject: [
        RentalContractRepositoryToken,
        PropertyRepositoryToken,
        UserRepositoryToken,
      ],
    },
  ],
  imports: [PropertiesModule, UsersModule],
  exports: [CreateRentalContractUseCase, RentalContractRepositoryToken],
})
export class RentalContractsModule {}
