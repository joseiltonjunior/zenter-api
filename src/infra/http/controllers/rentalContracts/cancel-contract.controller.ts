import {
  BadRequestException,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CancelRentalContractUseCase } from '@/domain/RentalContracts/use-cases/cancel-rental-contract.use-case'
import { OnlyAdminCanCancelContractError } from '@/domain/RentalContracts/errors/only-admin-can-cancel-contract.error'
import { ContractNotFoundError } from '@/domain/RentalContracts/errors/contract-not-found.error'
import { InvalidContractStatusError } from '@/domain/RentalContracts/errors/invalid-contract-status.error'
import { ApiTags } from '@nestjs/swagger'

const cancelContractSchema = z.object({
  reason: z
    .string()
    .min(3, 'Reason must have at least 3 characters.')
    .max(500, 'Reason must have at most 500 characters.'),
})

type CancelContractSchema = z.infer<typeof cancelContractSchema>

const cancelValidationPipe = new ZodValidationPipe(cancelContractSchema)

@ApiTags('Contracts')
@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class CancelContractController {
  constructor(private cancelRentalContract: CancelRentalContractUseCase) {}

  @Post(':id/cancel')
  async handle(
    @Param('id') id: string,
    @Body(cancelValidationPipe) body: CancelContractSchema,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      return await this.cancelRentalContract.execute({
        contractId: id,
        adminId: user.sub,
        reason: body.reason,
      })
    } catch (err) {
      if (err instanceof OnlyAdminCanCancelContractError) {
        throw new ForbiddenException('Only admins can cancel contracts.')
      }

      if (err instanceof ContractNotFoundError) {
        throw new NotFoundException('Contract not found.')
      }

      if (err instanceof InvalidContractStatusError) {
        throw new BadRequestException(
          'Only PENDING or ACTIVE contracts can be cancelled.',
        )
      }

      throw new InternalServerErrorException('Failed to cancel contract.')
    }
  }
}
