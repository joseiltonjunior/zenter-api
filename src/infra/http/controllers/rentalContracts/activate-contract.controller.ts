import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'

import { OnlyAdminCanActivateContractError } from '@/domain/RentalContracts/errors/only-admin-can-activate-contract.error'
import { ContractNotFoundError } from '@/domain/RentalContracts/errors/contract-not-found.error'
import { InvalidContractStatusError } from '@/domain/RentalContracts/errors/invalid-contract-status.error'
import { ActivateRentalContractUseCase } from '@/domain/RentalContracts/use-cases/activate-rental-contract.use-case'

@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class ActivateContractController {
  constructor(private activateRentalContract: ActivateRentalContractUseCase) {}

  @Post(':id/activate')
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    try {
      const result = await this.activateRentalContract.execute({
        contractId: id,
        adminId: user.sub,
      })

      return result
    } catch (err) {
      if (err instanceof OnlyAdminCanActivateContractError) {
        throw new ForbiddenException('Only admins can activate contracts.')
      }

      if (err instanceof ContractNotFoundError) {
        throw new NotFoundException('Contract not found.')
      }

      if (err instanceof InvalidContractStatusError) {
        throw new BadRequestException(
          'Only PENDING contracts can be activated.',
        )
      }

      console.error('Activate contract error:', err)
      throw new BadRequestException('Failed to activate contract.')
    }
  }
}
