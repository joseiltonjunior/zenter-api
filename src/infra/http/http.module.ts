import { Module } from '@nestjs/common'

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
})
export class HttpModule {}
