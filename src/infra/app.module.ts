import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'
import { CreateAccountController } from './http/controllers/users/create-account.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './http/controllers/users/authenticate.controller'
import { CreateTicketController } from './http/controllers/tickets/create-ticket.controller'
import { FetchRecentTicketController } from './http/controllers/tickets/fetch-recent-tickets.controller'
import { CreateMessageController } from './http/controllers/tickets/create-message.controller'
import { CreatePropertyController } from './http/controllers/properties/create-property.controller'
import { DeletePropertyController } from './http/controllers/properties/delete-property.controller'
import { CreateContractController } from './http/controllers/rentalContracts/create-contract.controller'
import { ActivateContractController } from './http/controllers/rentalContracts/activate-contract.controller'
import { RejectContractController } from './http/controllers/rentalContracts/reject-contract.controller'
import { CancelContractController } from './http/controllers/rentalContracts/cancel-contract.controller'

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
