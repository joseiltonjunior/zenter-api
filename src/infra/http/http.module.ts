import { Module } from '@nestjs/common'

import { RejectContractController } from './controllers/rentalContracts/reject-contract.controller'
import { CancelContractController } from './controllers/rentalContracts/cancel-contract.controller'

import { DatabaseModule } from '../database/database.module'
import { UsersModule } from './modules/users.module'
import { PropertiesModule } from './modules/properties.module'
import { TicketsModule } from './modules/tickets.module'
import { RentalContractsModule } from './modules/rental-contracts.module'

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PropertiesModule,
    TicketsModule,
    RentalContractsModule,
  ],
  controllers: [RejectContractController, CancelContractController],
})
export class HttpModule {}
