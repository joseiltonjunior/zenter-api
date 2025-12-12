import { Module } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { CreatePropertyController } from '@/infra/http/controllers/properties/create-property.controller'
import { DeletePropertyController } from '@/infra/http/controllers/properties/delete-property.controller'
import { PropertyRepositoryToken } from '@/domain/Properties/repositories/property-repository'
import { PrismaPropertyRepository } from '@/infra/database/prisma/prisma-property-repository.service'
import { CreatePropertyUseCase } from '@/domain/Properties/use-cases/create-property.use-case'
import { DeletePropertyUseCase } from '@/domain/Properties/use-cases/delete-property.use-case'

@Module({
  controllers: [CreatePropertyController, DeletePropertyController],
  providers: [
    PrismaService,
    {
      provide: PropertyRepositoryToken,
      useClass: PrismaPropertyRepository,
    },
    {
      provide: CreatePropertyUseCase,
      useFactory: (repo) => new CreatePropertyUseCase(repo),
      inject: [PropertyRepositoryToken],
    },
    {
      provide: DeletePropertyUseCase,
      useFactory: (repo) => new DeletePropertyUseCase(repo),
      inject: [PropertyRepositoryToken],
    },
  ],
  exports: [
    CreatePropertyUseCase,
    DeletePropertyUseCase,
    PropertyRepositoryToken,
  ],
})
export class PropertiesModule {}
