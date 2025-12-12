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
import { RejectRentalContractUseCase } from '@/domain/RentalContracts/use-cases/reject-rental-contract.use-case'
import { OnlyAdminCanRejectContractError } from '@/domain/RentalContracts/errors/only-admin-can-reject-contract.error'
import { ContractNotFoundError } from '@/domain/RentalContracts/errors/contract-not-found.error'
import { InvalidContractStatusError } from '@/domain/RentalContracts/errors/invalid-contract-status.error'

const rejectContractSchema = z.object({
  reason: z
    .string()
    .min(3, 'Reason must have at least 3 characters.')
    .max(500, 'Reason must have at most 500 characters.'),
})

type RejectContractSchema = z.infer<typeof rejectContractSchema>

const rejectValidationPipe = new ZodValidationPipe(rejectContractSchema)

@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class RejectContractController {
  constructor(private rejectRentalContract: RejectRentalContractUseCase) {}

  @Post(':id/reject')
  async handle(
    @Param('id') id: string,
    @Body(rejectValidationPipe) body: RejectContractSchema,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      return await this.rejectRentalContract.execute({
        contractId: id,
        adminId: user.sub,
        reason: body.reason,
      })
    } catch (err) {
      if (err instanceof OnlyAdminCanRejectContractError) {
        throw new ForbiddenException('Only admins can reject contracts.')
      }

      if (err instanceof ContractNotFoundError) {
        throw new NotFoundException('Contract not found.')
      }

      if (err instanceof InvalidContractStatusError) {
        throw new BadRequestException('Only PENDING contracts can be rejected.')
      }

      throw new InternalServerErrorException('Failed to reject contract.')
    }
  }
}
