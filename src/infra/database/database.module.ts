import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaUserRepository } from './prisma/prisma-user.repository.service'

@Module({
  providers: [PrismaService, PrismaUserRepository],
  exports: [PrismaService, PrismaUserRepository],
})
export class DatabaseModule {}
