import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/prisma/prisma.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { z } from 'zod'

const cancelContractSchema = z.object({
  reason: z
    .string()
    .min(3, 'Reason must have at least 3 characters.')
    .max(500, 'Reason must have at most 500 characters.'),
})

type CancelContractSchema = z.infer<typeof cancelContractSchema>

const cancelValidationPipe = new ZodValidationPipe(cancelContractSchema)

@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class CancelContractController {
  constructor(private prisma: PrismaService) {}

  @Post(':id/cancel')
  async handle(
    @Param('id') id: string,
    @Body(cancelValidationPipe) body: CancelContractSchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can cancel contracts.')
    }

    const { reason } = body

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Buscar contrato
        const contract = await tx.rentalContract.findUnique({
          where: { id },
          select: {
            id: true,
            propertyId: true,
            status: true,
          },
        })

        if (!contract) {
          throw new NotFoundException('Contract not found.')
        }

        // Estados permitidos para cancelar
        if (!['PENDING', 'ACTIVE'].includes(contract.status)) {
          throw new BadRequestException(
            `Contracts with status ${contract.status} cannot be cancelled.`,
          )
        }

        // 2) Atualizar propriedade
        const updatedProperty = await tx.property.updateMany({
          where: {
            id: contract.propertyId,
          },
          data: {
            status: 'AVAILABLE',
            reservedAt: null,
            reservedUntil: null,
          },
        })

        if (updatedProperty.count === 0) {
          throw new ConflictException(
            'Failed to update property during cancellation.',
          )
        }

        // 3) Cancelar contrato
        const cancelled = await tx.rentalContract.update({
          where: { id },
          data: {
            status: 'CANCELED',
            cancelledAt: new Date(),
            cancelReason: reason,
          },
          select: {
            id: true,
            userId: true,
            propertyId: true,
            adminId: true,
            initialContract: true,
            endContract: true,
            cancelledAt: true,
            cancelReason: true,
            status: true,
            property: {
              select: {
                id: true,
                title: true,
                status: true,
                address: true,
              },
            },
            user: { select: { id: true, name: true, email: true } },
            admin: { select: { id: true, name: true, email: true } },
          },
        })

        return cancelled
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

      console.error('Cancel contract error:', err)
      throw new InternalServerErrorException('Failed to cancel contract.')
    }
  }
}
