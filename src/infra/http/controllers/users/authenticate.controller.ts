import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { JwtService } from '@nestjs/jwt'
import z from 'zod'
import { AuthenticateUserUseCase } from '@/domain/Users/use-cases/authenticate-user.use-case'
import { InvalidCredentialsError } from '@/domain/Users/errors/invalid-credentials.error'

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AuthenticateRequestSwaggerDTO } from '../../swagger/users/authenticate-request.swagger.dto'
import { AuthenticateResponseSwaggerDTO } from '../../swagger/users/authenticate-response.swagger.dto'

const authenticateBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@ApiTags('Users')
@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private jwt: JwtService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Authenticates a user using email and password and returns a JWT access token.',
  })
  @ApiBody({
    type: AuthenticateRequestSwaggerDTO,
    description: 'User credentials',
  })
  @ApiOkResponse({
    description: 'User authenticated successfully',
    type: AuthenticateResponseSwaggerDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request payload',
  })
  async handle(@Body(bodyValidationPipe) body: AuthenticateBodySchema) {
    try {
      const result = await this.authenticateUserUseCase.execute({
        email: body.email,
        password: body.password,
      })

      const accessToken = this.jwt.sign({ sub: result.id, role: result.role })

      return { access_token: accessToken }
    } catch (err: unknown) {
      if (err instanceof InvalidCredentialsError) {
        throw new UnauthorizedException('User credentials do not match.')
      }
      throw err
    }
  }
}
