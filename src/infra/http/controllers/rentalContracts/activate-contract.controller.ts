import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class ActivateContractController {
  constructor(private prisma: PrismaService) {}

  @Post(':id/activate')
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const isAdmin = user.role === 'ADMIN'

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can create contracts.')
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const contract = await tx.rentalContract.findUnique({
          where: { id },
          select: { id: true, status: true, propertyId: true },
        })

        if (!contract) throw new NotFoundException('Contract not found.')
        if (contract.status !== 'PENDING') {
          throw new BadRequestException(
            'Only PENDING contracts can be activated.',
          )
        }

        await tx.property.update({
          where: { id: contract.propertyId },
          data: { status: 'OCCUPIED' },
        })

        const activated = await tx.rentalContract.update({
          where: { id },
          data: { status: 'ACTIVE', activatedAt: new Date() },
          select: {
            id: true,
            userId: true,
            propertyId: true,
            adminId: true,
            initialContract: true,
            endContract: true,
            activatedAt: true,
            status: true,
            property: {
              select: { id: true, title: true, status: true, address: true },
            },
            user: { select: { id: true, name: true, email: true } },
            admin: { select: { id: true, name: true, email: true } },
          },
        })

        return activated
      })

      return result
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof ForbiddenException
      ) {
        throw err
      }
      console.error('Activate contract error:', err)
      throw new InternalServerErrorException('Failed to activate contract.')
    }
  }
}
