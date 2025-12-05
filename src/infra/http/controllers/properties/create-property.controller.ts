import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { z } from 'zod'

const createPropertyBodySchema = z.object({
  title: z.string().min(3),
  address: z.string(),
  type: z.enum(['HOUSE', 'APARTMENT', 'STUDIO', 'KITNET', 'ROOM']),
})

const bodyValidationPipe = new ZodValidationPipe(createPropertyBodySchema)

type CreatePropertyBodySchema = z.infer<typeof createPropertyBodySchema>

@Controller('/properties')
@UseGuards(JwtAuthGuard)
export class CreatePropertyController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreatePropertyBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, address, type } = body

    const isAdmin = user.role === 'ADMIN'

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can create properties.')
    }

    const property = await this.prisma.property.create({
      data: {
        title,
        address,
        type,
      },
    })

    return property
  }
}
