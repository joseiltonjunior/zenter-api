import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { JwtService } from '@nestjs/jwt'
import z from 'zod'
import { AuthenticateUserUseCase } from '@/domain/Users/use-cases/authenticate-user.use-case'
import { InvalidCredentialsError } from '@/domain/Users/errors/invalid-credentials.error'

const authenticateBodySchema = z.object({
  email: z.email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private jwt: JwtService,
  ) {}

  @Post()
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
