import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { z } from 'zod'

const createTicketBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  propertyId: z.uuid().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(createTicketBodySchema)

type CreateTicketBodySchema = z.infer<typeof createTicketBodySchema>

@Controller('/tickets')
@UseGuards(JwtAuthGuard)
export class CreateTicketController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateTicketBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, description, propertyId } = body

    try {
      if (propertyId) {
        const isAdmin = user.role === 'ADMIN'

        if (!isAdmin) {
          const contract = await this.prisma.rentalContract.findFirst({
            where: {
              userId: user.sub,
              propertyId,
              status: 'ACTIVE',
            },
          })

          if (!contract) {
            throw new ForbiddenException(
              'You cannot open a ticket for a property you are not renting.',
            )
          }
        }
      }

      const ticket = await this.prisma.ticket.create({
        data: {
          title,
          description: description ?? null,
          userId: user.sub,
          propertyId: propertyId ?? null,
        },
      })

      return ticket
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'You already have a ticket with this title.',
        )
      }

      throw error
    }
  }
}
