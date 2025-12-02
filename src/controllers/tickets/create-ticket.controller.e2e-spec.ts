import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Role } from '@prisma/client'
import request from 'supertest'

describe('Create ticket (E2E)', () => {
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

  test('[POST] /tickets - admin can create without propertyId', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const response = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Admin ticket',
        description: 'Something wrong here',
      })

    expect(response.statusCode).toBe(201)

    const ticket = await prisma.ticket.findFirst({
      where: { title: 'Admin ticket' },
    })

    expect(ticket).toBeTruthy()
    expect(ticket?.description).toBe('Something wrong here')
    expect(ticket?.propertyId).toBeNull()
  })

  // test('[POST] /tickets - user with ACTIVE contract can create for property', async () => {
  //   const token = await authenticateTestUser(app, prisma, Role.USER)

  //   const user = await prisma.user.findFirst({
  //     where: { email: 'test@example.com' },
  //   })

  //   const property = await prisma.property.create({
  //     data: {
  //       title: 'Casa Contratada',
  //       address: 'Rua Fulana, 123',
  //       type: 'HOUSE',
  //     },
  //   })

  //   await prisma.rentalContract.create({
  //     data: {
  //       userId: user!.id,
  //       propertyId: property.id,
  //       status: ContractStatus.ACTIVE,
  //       startAt: new Date(),
  //     },
  //   })

  //   const res = await request(app.getHttpServer())
  //     .post('/tickets')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({
  //       title: 'Problema na pia',
  //       propertyId: property.id,
  //     })

  //   expect(res.statusCode).toBe(201)

  //   const ticket = await prisma.ticket.findFirst({
  //     where: { title: 'Problema na pia' },
  //   })

  //   expect(ticket).toBeTruthy()
  //   expect(ticket?.propertyId).toBe(property.id)
  // })

  test('[POST] /tickets - user cannot create for property without contract', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.USER)

    const property = await prisma.property.create({
      data: {
        title: 'Casa sem contrato',
        address: 'Rua Teste 55',
        type: 'HOUSE',
      },
    })

    const res = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Erro esperado',
        propertyId: property.id,
      })

    expect(res.statusCode).toBe(403)
    expect(res.body.message).toBe(
      'You cannot open a ticket for a property you are not renting.',
    )
  })

  test('[POST] /tickets - 400 when title is too short', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const res = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ab',
      })

    expect(res.statusCode).toBe(400)
  })

  test('[POST] /tickets - 409 on duplicate title (P2002)', async () => {
    const { token, user } = await authenticateTestUser(app, prisma, Role.ADMIN)

    await prisma.ticket.create({
      data: {
        title: 'Duplicado',
        userId: user.id,
      },
    })

    const res = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Duplicado',
      })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toBe('You already have a ticket with this title.')
  })
})
