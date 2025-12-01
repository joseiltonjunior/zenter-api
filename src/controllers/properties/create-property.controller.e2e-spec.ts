import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Create property (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    await app.init()
  })

  test('[POST] /properties - admin can create', async () => {
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('123456', 8),
        role: Role.ADMIN,
      },
    })

    const authResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    expect(authResponse.statusCode).toBe(201)

    const { access_token: acessToken } = authResponse.body

    expect(acessToken).toBeDefined()

    const response = await request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${acessToken}`)
      .send({
        title: 'Casa A',
        address: 'R. Iolanda Rodrigues Sobral, 6 - Iputinga, Recife - PE',
        type: 'HOUSE',
      })

    expect(response.statusCode).toBe(201)

    const property = await prisma.property.findFirst({
      where: { title: 'Casa A' },
    })

    expect(property).toBeTruthy()
    expect(property?.type).toBe('HOUSE')
  })
})
