import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
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

const createMessageBodySchema = z.object({
  message: z.string().min(3, 'Message must have at least 3 characters'),
  ticketId: z.uuid(),
})

const bodyValidationPipe = new ZodValidationPipe(createMessageBodySchema)

type CreateMessageBodySchema = z.infer<typeof createMessageBodySchema>

@Controller('/messages')
@UseGuards(JwtAuthGuard)
export class CreateMessageController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateMessageBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { message, ticketId } = body

    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { userId: true, status: true },
      })

      if (!ticket) {
        throw new NotFoundException('Ticket not found.')
      }

      const isOwner = ticket.userId === user.sub
      const isAdmin = user.role === 'ADMIN'

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('You cannot send messages to this ticket.')
      }

      if (ticket.status === 'CLOSED') {
        throw new ForbiddenException('Cannot send messages to a closed ticket.')
      }

      await this.prisma.ticketMessage.create({
        data: {
          content: message,
          senderId: user.sub,
          ticketId,
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
