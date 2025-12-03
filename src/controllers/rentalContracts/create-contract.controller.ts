import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createContractBodySchema = z.object({
  initialContract: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'initialContract must be an ISO date string',
  }),
  endContract: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'endContract must be an ISO date string',
  }),
  propertyId: z.string(),
  userId: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createContractBodySchema)

type CreateContractBodySchema = z.infer<typeof createContractBodySchema>

@Controller('/contracts')
@UseGuards(JwtAuthGuard)
export class CreateContractController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateContractBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { initialContract, endContract, propertyId, userId } = body

    const isAdmin = user.role === 'ADMIN'

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can create contracts.')
    }

    const initialDate = new Date(initialContract)
    const endDate = new Date(endContract)

    if (initialDate >= endDate) {
      throw new BadRequestException(
        'initialContract must be before endContract.',
      )
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const reserved = await tx.property.updateMany({
          where: {
            id: propertyId,
            status: 'AVAILABLE',
          },
          data: {
            status: 'RESERVED',
            reservedAt: new Date(),
            reservedUntil: initialDate,
          },
        })

        if (reserved.count === 0) {
          throw new ConflictException('Property is not available to reserve.')
        }

        const tenant = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })
        if (!tenant) {
          throw new BadRequestException('User (tenant) not found.')
        }

        const contract = await tx.rentalContract.create({
          data: {
            initialContract: initialDate,
            endContract: endDate,
            adminId: user.sub,
            propertyId,
            userId,
          },
        })

        return contract
      })

      return result
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err
      }
      console.error('Failed creating contract:', err)
      throw new InternalServerErrorException('Failed to create contract.')
    }
  }
}
