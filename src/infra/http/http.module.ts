import { Module } from '@nestjs/common'

import { FetchRecentTicketController } from './controllers/tickets/fetch-recent-tickets.controller'

import { ActivateContractController } from './controllers/rentalContracts/activate-contract.controller'
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
  controllers: [
    FetchRecentTicketController,
    ActivateContractController,
    RejectContractController,
    CancelContractController,
  ],
})
export class HttpModule {}
