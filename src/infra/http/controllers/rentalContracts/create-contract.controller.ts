import {
  Body,
  Controller,
  Post,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common'

import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { CreateRentalContractUseCase } from '@/domain/RentalContracts/use-cases/create-rental-contract.use-case'
import { OnlyAdminCanCreateContractError } from '@/domain/RentalContracts/errors/only-admin-can-create-contract.error'
import { InvalidContractDatesError } from '@/domain/RentalContracts/errors/invalid-contract-dates.error'
import { TenantNotFoundError } from '@/domain/RentalContracts/errors/tenant-not-found.error'
import { PropertyNotAvailableError } from '@/domain/RentalContracts/errors/property-not-available.error'
import { ApiTags } from '@nestjs/swagger'

const bodySchema = z.object({
  initialContract: z.string(),
  endContract: z.string(),
  propertyId: z.string(),
  userId: z.uuid(),
})

@ApiTags('Contracts')
@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class CreateContractController {
  constructor(private createContract: CreateRentalContractUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: z.infer<typeof bodySchema>,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      return await this.createContract.execute({
        initialContract: new Date(body.initialContract),
        endContract: new Date(body.endContract),
        propertyId: body.propertyId,
        userId: body.userId,
        adminId: user.sub,
      })
    } catch (err) {
      if (err instanceof OnlyAdminCanCreateContractError)
        throw new ForbiddenException(err.message)

      if (err instanceof InvalidContractDatesError)
        throw new BadRequestException(err.message)

      if (err instanceof TenantNotFoundError)
        throw new BadRequestException(err.message)

      if (err instanceof PropertyNotAvailableError)
        throw new ConflictException(err.message)

      throw new InternalServerErrorException('Failed to create contract.')
    }
  }
}
