import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CreateMessageUseCase } from '@/domain/Tickets/use-cases/create-message.use-case'
import { TicketNotFoundError } from '@/domain/Tickets/errors/ticket-not-found.error'
import { MessageNotAllowedError } from '@/domain/Tickets/errors/message-forbidden.error'
import { ClosedTicketError } from '@/domain/Tickets/errors/closed-ticket.error'
import { ApiTags } from '@nestjs/swagger'

const schema = z.object({
  message: z.string().min(3),
  ticketId: z.uuid(),
})

type BodySchema = z.infer<typeof schema>

@ApiTags('Tickets')
@Controller('/messages')
@UseGuards(JwtAuthGuard)
export class CreateMessageController {
  constructor(private createMessage: CreateMessageUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(schema)) body: BodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      await this.createMessage.execute({
        content: body.message,
        ticketId: body.ticketId,
        senderId: user.sub,
        senderRole: user.role,
      })
    } catch (err) {
      if (err instanceof TicketNotFoundError) {
        throw new NotFoundException({
          message: 'Ticket not found',
          code: err.message,
        })
      }

      if (err instanceof MessageNotAllowedError) {
        throw new ForbiddenException({
          message: 'You cannot send messages to this ticket',
          code: err.message,
        })
      }

      if (err instanceof ClosedTicketError) {
        throw new ForbiddenException({
          message: 'Cannot send messages to a closed ticket',
          code: err.message,
        })
      }

      throw err
    }
  }
}
