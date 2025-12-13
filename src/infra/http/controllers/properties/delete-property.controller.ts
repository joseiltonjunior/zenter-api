import {
  Controller,
  Delete,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'

import { PropertyNotFoundError } from '@/domain/Properties/errors/property-not-found.error'
import { PropertyHasActiveContractError } from '@/domain/Properties/errors/property-has-active-contract.error'
import { PropertyIsOccupiedError } from '@/domain/Properties/errors/property-is-occupied.error'
import { DeletePropertyUseCase } from '@/domain/Properties/use-cases/delete-property.use-case'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Property')
@Controller('/properties/:id')
@UseGuards(JwtAuthGuard)
export class DeletePropertyController {
  constructor(private deletePropertyUseCase: DeletePropertyUseCase) {}

  @Delete()
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete properties.')
    }

    try {
      await this.deletePropertyUseCase.execute({ id })
      return { message: 'Property deleted successfully.' }
    } catch (err: unknown) {
      if (err instanceof PropertyNotFoundError) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof PropertyHasActiveContractError) {
        throw new ConflictException(err.message)
      }
      if (err instanceof PropertyIsOccupiedError) {
        throw new ConflictException(err.message)
      }
      throw err
    }
  }
}
