import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './controllers/users/create-account.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/users/authenticate.controller'
import { CreateTicketController } from './controllers/tickets/create-ticket.controller'
import { FetchRecentTicketController } from './controllers/tickets/fetch-recent-tickets.controller'
import { CreateMessageController } from './controllers/tickets/create-message.controller'
import { CreatePropertyController } from './controllers/properties/create-property.controller'
import { DeletePropertyController } from './controllers/properties/delete-property.controller'
import { CreateContractController } from './controllers/rentalContracts/create-contract.controller'
import { ActivateContractController } from './controllers/rentalContracts/activate-contract.controller'
import { RejectContractController } from './controllers/rentalContracts/reject-contract.controller'
import { CancelContractController } from './controllers/rentalContracts/cancel-contract.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateTicketController,
    FetchRecentTicketController,
    CreateMessageController,
    CreatePropertyController,
    DeletePropertyController,
    CreateContractController,
    ActivateContractController,
    RejectContractController,
    CancelContractController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
