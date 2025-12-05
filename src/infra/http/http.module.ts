import { Module } from '@nestjs/common'
import { CreateTicketController } from './controllers/tickets/create-ticket.controller'
import { FetchRecentTicketController } from './controllers/tickets/fetch-recent-tickets.controller'
import { CreateMessageController } from './controllers/tickets/create-message.controller'
import { CreateContractController } from './controllers/rentalContracts/create-contract.controller'
import { ActivateContractController } from './controllers/rentalContracts/activate-contract.controller'
import { RejectContractController } from './controllers/rentalContracts/reject-contract.controller'
import { CancelContractController } from './controllers/rentalContracts/cancel-contract.controller'

import { DatabaseModule } from '../database/database.module'
import { UsersModule } from './modules/users.module'
import { PropertyModule } from './modules/properties.module'

@Module({
  imports: [DatabaseModule, UsersModule, PropertyModule],
  controllers: [
    CreateTicketController,
    FetchRecentTicketController,
    CreateMessageController,
    CreateContractController,
    ActivateContractController,
    RejectContractController,
    CancelContractController,
  ],
})
export class HttpModule {}
