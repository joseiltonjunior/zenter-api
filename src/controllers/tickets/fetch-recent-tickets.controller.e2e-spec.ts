import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Role } from '@prisma/client'
import request from 'supertest'

describe('Fetch recent tickets (E2E)', () => {
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

  test('[GET] /tickets - returns the most recent 10 tickets', async () => {
    const { token, user } = await authenticateTestUser(app, prisma, Role.ADMIN)

    await prisma.ticket.deleteMany()

    await prisma.ticket.create({ data: { title: 'Ticket 1', userId: user.id } })
    await prisma.ticket.create({ data: { title: 'Ticket 2', userId: user.id } })
    await prisma.ticket.create({ data: { title: 'Ticket 3', userId: user.id } })

    const res = await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)

    expect(res.body.tickets.length).toBe(3)
    expect(res.body.tickets[0].title).toBe('Ticket 3')
    expect(res.body.tickets[1].title).toBe('Ticket 2')
    expect(res.body.tickets[2].title).toBe('Ticket 1')

    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.perPage).toBe(10)
    expect(res.body.pagination.total).toBe(3)
    expect(res.body.pagination.totalPages).toBe(1)
    expect(res.body.pagination.hasNext).toBe(false)
    expect(res.body.pagination.hasPrev).toBe(false)
  })

  test('[GET] /tickets?page=2 - returns correct tickets for page 2', async () => {
    const { token, user } = await authenticateTestUser(app, prisma, Role.ADMIN)

    await prisma.ticket.deleteMany()

    for (let i = 1; i <= 15; i++) {
      await prisma.ticket.create({
        data: { title: `T${i}`, userId: user.id },
      })
    }

    const res = await request(app.getHttpServer())
      .get('/tickets?page=2')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)

    // page 1 → T15 ... T6
    // page 2 → T5 ... T1 (5 itens)

    expect(res.body.tickets.length).toBe(5)
    expect(res.body.tickets[0].title).toBe('T5')
    expect(res.body.tickets[4].title).toBe('T1')

    expect(res.body.pagination.page).toBe(2)
    expect(res.body.pagination.total).toBe(15)
    expect(res.body.pagination.totalPages).toBe(2)
    expect(res.body.pagination.hasNext).toBe(false)
    expect(res.body.pagination.hasPrev).toBe(true)
  })

  test('[GET] /tickets - returns empty array when no tickets exist', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    await prisma.ticket.deleteMany()

    const res = await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.tickets).toEqual([])

    expect(res.body.pagination.total).toBe(0)
    expect(res.body.pagination.totalPages).toBe(0)
    expect(res.body.pagination.hasNext).toBe(false)
    expect(res.body.pagination.hasPrev).toBe(false)
  })

  test('[GET] /tickets?page=0 - returns 400 for invalid page', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const res = await request(app.getHttpServer())
      .get('/tickets?page=0')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(400)
  })
})
