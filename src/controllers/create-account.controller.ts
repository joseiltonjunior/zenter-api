import { Body, ConflictException, Controller, Post } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema)

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(@Body(bodyValidationPipe) body: CreateAccountBodySchema) {
    const { name, email, password } = body

    if (email) {
      const userWithSameEmail = await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        throw new ConflictException(
          'User with same e-mail address already exists.',
        )
      }

      const hashedPassword = await hash(password, 8)

      await this.prisma.user.create({
        data: { name, email, password: hashedPassword },
      })
    }
  }
}
