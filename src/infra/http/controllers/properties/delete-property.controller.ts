import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Controller('/properties/:id')
@UseGuards(JwtAuthGuard)
export class DeletePropertyController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Property ID is required.')
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can detele properties.')
    }

    const property = await this.prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      throw new NotFoundException('Property not found.')
    }

    const activeContract = await this.prisma.rentalContract.findFirst({
      where: {
        propertyId: id,
        status: 'ACTIVE',
      },
    })

    if (activeContract) {
      throw new ConflictException(
        'You cannot delete a property with an active contract.',
      )
    }

    if (property.status === 'OCCUPIED') {
      throw new ConflictException(
        'You cannot delete a property that is currently occupied.',
      )
    }

    await this.prisma.property.delete({
      where: { id },
    })

    return { message: 'Property deleted successfully.' }
  }
}
