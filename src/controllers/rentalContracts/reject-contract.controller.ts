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
  constructor(private prisma: PrismaService) {}

  @Post(':id/reject')
  async handle(
    @Param('id') id: string,
    @Body(rejectValidationPipe) body: RejectContractSchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can reject contracts.')
    }

    const { reason } = body

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Buscar contrato
        const contract = await tx.rentalContract.findUnique({
          where: { id },
          select: { id: true, status: true, propertyId: true },
        })

        if (!contract) throw new NotFoundException('Contract not found.')

        if (contract.status !== 'PENDING') {
          throw new BadRequestException(
            'Only PENDING contracts can be rejected.',
          )
        }

        // 2) Property estava RESERVED → voltar para AVAILABLE
        const updatedProperty = await tx.property.updateMany({
          where: {
            id: contract.propertyId,
            status: 'RESERVED',
          },
          data: {
            status: 'AVAILABLE',
            reservedAt: null,
            reservedUntil: null,
          },
        })

        if (updatedProperty.count === 0) {
          throw new ConflictException(
            'Property is not reserved or cannot be released.',
          )
        }

        // 3) Rejeitar contrato com motivo
        const rejected = await tx.rentalContract.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date(),
            rejectedReason: reason,
          },
          select: {
            id: true,
            userId: true,
            propertyId: true,
            adminId: true,
            initialContract: true,
            endContract: true,
            rejectedAt: true,
            rejectedReason: true,
            status: true,
            property: {
              select: { id: true, title: true, status: true, address: true },
            },
            user: { select: { id: true, name: true, email: true } },
            admin: { select: { id: true, name: true, email: true } },
          },
        })

        return rejected
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

      console.error('Reject contract error:', err)
      throw new InternalServerErrorException('Failed to reject contract.')
    }
  }
}
