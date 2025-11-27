import { Controller, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
// import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
// import { z } from 'zod'

// const createTicketBodySchema = z.object({
//   title: z.string().min(3),
//   description: z.string().optional(),
// })

// type CreateTicketBodySchema = z.infer<typeof createTicketBodySchema>

@Controller('/tickets')
@UseGuards(JwtAuthGuard)
export class CreateTicketController {
  constructor(private prisma: PrismaService) {}

  @Post()
  // @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(createTicketBodySchema))
  async handle() {
    return 'ok'
  }
}
