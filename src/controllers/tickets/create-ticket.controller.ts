import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createTicketBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
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
    const { title, description } = body

    try {
      await this.prisma.ticket.create({
        data: {
          title,
          description: description ?? null,
          userId: user.sub,
        },
      })
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
