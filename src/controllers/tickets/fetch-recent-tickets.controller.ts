import { Controller, Get, Query, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'

import { PrismaService } from '@/prisma/prisma.service'
import z from 'zod'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt.strategy'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

@Controller('/tickets')
@UseGuards(JwtAuthGuard)
export class FetchRecentTicketController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const perPage = 10

    const isAdmin = user.role === 'ADMIN'

    const where = isAdmin ? {} : { userId: user.sub }
    const total = await this.prisma.ticket.count({ where })

    const tickets = await this.prisma.ticket.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalPages = Math.ceil(total / perPage)

    return {
      tickets,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }
}
