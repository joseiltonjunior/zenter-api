import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

import { z } from 'zod'
import { CreateTicketUseCase } from '@/domain/Tickets/use-cases/create-ticket.use-case'
import { ForbiddenToOpenTicketError } from '@/domain/Tickets/errors/forbidden-to-open-ticket.error'
import { DuplicateTicketError } from '@/domain/Tickets/errors/duplicate-ticket.error'

const createTicketBodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  propertyId: z.uuid().optional(),
})

type CreateTicketBody = z.infer<typeof createTicketBodySchema>

@Controller('/tickets')
@UseGuards(JwtAuthGuard)
export class CreateTicketController {
  constructor(private createTicket: CreateTicketUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createTicketBodySchema)) body: CreateTicketBody,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      return await this.createTicket.execute({
        title: body.title,
        description: body.description,
        propertyId: body.propertyId,
        userId: user.sub,
        userRole: user.role,
      })
    } catch (err) {
      if (err instanceof ForbiddenToOpenTicketError) {
        throw new ForbiddenException({
          message:
            'You cannot open a ticket for a property you are not renting.',
          code: err.message,
        })
      }

      if (err instanceof DuplicateTicketError) {
        throw new ConflictException({
          message: 'A ticket with this title already exists.',
          code: err.message,
        })
      }

      throw err
    }
  }
}
