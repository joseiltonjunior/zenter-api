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

import { z } from 'zod'
import { CreatePropertyUseCase } from '@/domain/Properties/use-cases/create-property.use-case'
import { ApiTags } from '@nestjs/swagger'

const createPropertyBodySchema = z.object({
  title: z.string().min(3),
  address: z.string(),
  type: z.enum(['HOUSE', 'APARTMENT', 'STUDIO', 'KITNET', 'ROOM']),
})

const bodyValidationPipe = new ZodValidationPipe(createPropertyBodySchema)

type CreatePropertyBodySchema = z.infer<typeof createPropertyBodySchema>

@ApiTags('Property')
@Controller('/properties')
@UseGuards(JwtAuthGuard)
export class CreatePropertyController {
  constructor(private createPropertyUseCase: CreatePropertyUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreatePropertyBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create properties.')
    }

    const property = await this.createPropertyUseCase.execute({
      title: body.title,
      address: body.address,
      type: body.type,
    })

    return property
  }
}
