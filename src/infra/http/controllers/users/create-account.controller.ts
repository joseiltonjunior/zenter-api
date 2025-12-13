import { Body, ConflictException, Controller, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { CreateUserUseCase } from '@/domain/Users/use-cases/create-user.use-case'
import { CreateUserData } from '@/domain/Users/repositories/user-repository'
import { UserAlreadyExistsError } from '@/domain/Users/errors/user-already-exists.error'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { CreateUserRequestSwaggerDTO } from '../../swagger/users/create-user-request.swagger.dto'
import { CreateUserResponseSwaggerDTO } from '../../swagger/users/create-user-response.swagger.dto'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema)

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@ApiTags('Users')
@Controller('/accounts')
export class CreateAccountController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
  })
  @ApiBody({
    type: CreateUserRequestSwaggerDTO,
  })
  @ApiCreatedResponse({
    description: 'User account successfully created',
    type: CreateUserResponseSwaggerDTO,
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error',
  })
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
