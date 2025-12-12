import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { PropertyRepositoryToken } from '@/domain/Properties/repositories/property-repository'
import { UserRepositoryToken } from '@/domain/Users/repositories/user-repository'
import { RentalContractRepositoryToken } from '@/domain/RentalContracts/repositories/rental-contract-repository'

import { PrismaRentalContractRepository } from '@/infra/database/prisma/prisma-rental-contract-repository.service'

import { CreateRentalContractUseCase } from '@/domain/RentalContracts/use-cases/create-rental-contract.use-case'
import { ActivateRentalContractUseCase } from '@/domain/RentalContracts/use-cases/activate-rental-contract.use-case'
import { CancelRentalContractUseCase } from '@/domain/RentalContracts/use-cases/cancel-rental-contract.use-case'
import { RejectRentalContractUseCase } from '@/domain/RentalContracts/use-cases/reject-rental-contract.use-case'

import { CreateContractController } from '@/infra/http/controllers/rentalContracts/create-contract.controller'
import { ActivateContractController } from '@/infra/http/controllers/rentalContracts/activate-contract.controller'
import { CancelContractController } from '@/infra/http/controllers/rentalContracts/cancel-contract.controller'
import { RejectContractController } from '@/infra/http/controllers/rentalContracts/reject-contract.controller'

import { PropertiesModule } from './properties.module'
import { UsersModule } from './users.module'

@Module({
  controllers: [
    CreateContractController,
    ActivateContractController,
    CancelContractController,
    RejectContractController,
  ],
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

    {
      provide: ActivateRentalContractUseCase,
      useFactory: (contracts, properties, users) =>
        new ActivateRentalContractUseCase(contracts, properties, users),
      inject: [
        RentalContractRepositoryToken,
        PropertyRepositoryToken,
        UserRepositoryToken,
      ],
    },

    {
      provide: CancelRentalContractUseCase,
      useFactory: (contracts, properties, users) =>
        new CancelRentalContractUseCase(contracts, properties, users),
      inject: [
        RentalContractRepositoryToken,
        PropertyRepositoryToken,
        UserRepositoryToken,
      ],
    },

    {
      provide: RejectRentalContractUseCase,
      useFactory: (contracts, properties, users) =>
        new RejectRentalContractUseCase(contracts, properties, users),
      inject: [
        RentalContractRepositoryToken,
        PropertyRepositoryToken,
        UserRepositoryToken,
      ],
    },
  ],
  imports: [PropertiesModule, UsersModule],
  exports: [
    CreateRentalContractUseCase,
    ActivateRentalContractUseCase,
    CancelRentalContractUseCase,
    RejectRentalContractUseCase,
    RentalContractRepositoryToken,
  ],
})
export class RentalContractsModule {}
