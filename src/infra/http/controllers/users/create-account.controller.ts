import { Body, ConflictException, Controller, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { CreateUserUseCase } from '@/domain/Users/use-cases/create-user.use-case'
import { CreateUserData } from '@/domain/Users/repositories/user-repository'
import { UserAlreadyExistsError } from '@/domain/Users/errors/user-already-exists.error'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema)

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  async handle(@Body(bodyValidationPipe) body: CreateAccountBodySchema) {
    try {
      const dto: CreateUserData = {
        name: body.name,
        email: body.email,
        password: body.password,
      }
      const created = await this.createUserUseCase.execute(dto)
      return { id: created.id, name: created.name, email: created.email }
    } catch (err: unknown) {
      if (err instanceof UserAlreadyExistsError) {
        throw new ConflictException(err.message)
      }
      throw err
    }
  }
}
