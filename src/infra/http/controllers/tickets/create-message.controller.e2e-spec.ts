import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Role, TicketStatus } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('Create message (E2E)', () => {
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

  test('[POST] /messages - admin can send message to any ticket', async () => {
    const { token, user } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const ticket = await prisma.ticket.create({
      data: {
        title: 'Ticket Admin',
        userId: user.id,
      },
    })

    const res = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Admin message',
        ticketId: ticket.id,
      })

    expect(res.statusCode).toBe(201)

    const msg = await prisma.ticketMessage.findFirst({
      where: { ticketId: ticket.id },
    })

    expect(msg).toBeTruthy()
    expect(msg?.content).toBe('Admin message')
    expect(msg?.senderId).toBe(user.id)
  })

  /**
   * 2) USER dono do ticket pode mandar mensagem
   */
  // test('[POST] /messages - user owner can send message', async () => {
  //   const { token, user } = await authenticateTestUser(app, prisma, Role.USER)

  //   const ticket = await prisma.ticket.create({
  //     data: {
  //       title: 'Ticket User Owner',
  //       userId: user.id,
  //     },
  //   })

  //   const res = await request(app.getHttpServer())
  //     .post('/messages')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({
  //       message: 'Hello from owner',
  //       ticketId: ticket.id,
  //     })

  //   expect(res.statusCode).toBe(201)

  //   const msg = await prisma.ticketMessage.findFirst({
  //     where: { ticketId: ticket.id },
  //   })

  //   expect(msg).toBeTruthy()
  //   expect(msg?.content).toBe('Hello from owner')
  //   expect(msg?.senderId).toBe(user.id)
  // })

  /**
   * 3) USER que não é dono do ticket leva 403
   */
  // test('[POST] /messages - user cannot send to a ticket they do not own', async () => {
  //   const { token: tokenUserA, user: userA } = await authenticateTestUser(
  //     app,
  //     prisma,
  //     Role.USER,
  //   )

  //   const { token: tokenUserB } = await authenticateTestUser(
  //     app,
  //     prisma,
  //     Role.USER,
  //   )

  //   const ticket = await prisma.ticket.create({
  //     data: {
  //       title: 'Ticket User A',
  //       userId: userA.id,
  //     },
  //   })

  //   const res = await request(app.getHttpServer())
  //     .post('/messages')
  //     .set('Authorization', `Bearer ${tokenUserB}`)
  //     .send({
  //       message: 'Intruder message',
  //       ticketId: ticket.id,
  //     })

  //   expect(res.statusCode).toBe(403)
  //   expect(res.body.message).toBe('You cannot send messages to this ticket.')
  // })

  test('[POST] /messages - ticket not found returns 404', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)
    const fakeId = randomUUID()

    const res = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Whatever',
        ticketId: fakeId,
      })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('Ticket not found')
  })

  test('[POST] /messages - cannot send message to CLOSED ticket', async () => {
    const { token, user } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const ticket = await prisma.ticket.create({
      data: {
        title: 'Closed Ticket',
        userId: user.id,
        status: TicketStatus.CLOSED,
      },
    })

    const res = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Attempt on closed ticket',
        ticketId: ticket.id,
      })

    expect(res.statusCode).toBe(403)
    expect(res.body.message).toBe('Cannot send messages to a closed ticket')
  })
})
