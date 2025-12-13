import { Controller, Get, Query, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import z from 'zod'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { FetchRecentTicketsUseCase } from '@/domain/Tickets/use-cases/fetch-recent-tickets.use-case'
import { ApiTags } from '@nestjs/swagger'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

@ApiTags('Tickets')
@Controller('/tickets')
@UseGuards(JwtAuthGuard)
export class FetchRecentTicketController {
  constructor(private fetchRecentTickets: FetchRecentTicketsUseCase) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.fetchRecentTickets.execute({
      page,
      userId: user.sub,
      userRole: user.role,
    })
  }
}
