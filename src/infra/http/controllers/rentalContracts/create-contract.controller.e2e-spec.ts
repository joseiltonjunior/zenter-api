import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { Role } from '@prisma/client'

describe('Create contract (E2E)', () => {
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

  beforeEach(async () => {
    await prisma.rentalContract.deleteMany()
    await prisma.property.updateMany({
      data: { status: 'AVAILABLE', reservedAt: null, reservedUntil: null },
    })
    await prisma.user.deleteMany()
    await prisma.property.deleteMany()
  })

  test('[POST] /contracts - admin creates contract successfully', async () => {
    const { token: adminToken, user: admin } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const tenant = await prisma.user.create({
      data: {
        name: 'Tenant',
        email: 'tenant@test.com',
        password: '123',
        role: 'USER',
      },
    })

    const property = await prisma.property.create({
      data: {
        title: 'Casa Teste',
        address: 'Rua X',
        type: 'HOUSE',
        status: 'AVAILABLE',
      },
    })

    const initial = new Date(Date.now() + 86400000).toISOString()
    const end = new Date(Date.now() + 86400000 * 30).toISOString()

    const response = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        initialContract: initial,
        endContract: end,
        propertyId: property.id,
        userId: tenant.id,
      })

    expect(response.statusCode).toBe(201)

    const contract = await prisma.rentalContract.findFirst({
      where: { userId: tenant.id },
    })

    expect(contract).toBeTruthy()
    expect(contract?.propertyId).toBe(property.id)
    expect(contract?.adminId).toBe(admin.id)
    expect(contract?.status).toBe('PENDING')

    const updatedProperty = await prisma.property.findUnique({
      where: { id: property.id },
    })

    expect(updatedProperty?.status).toBe('RESERVED')
    expect(updatedProperty?.reservedUntil?.toISOString()).toBe(initial)
  })

  test('[POST] /contracts - user cannot create contract', async () => {
    const { token: userToken } = await authenticateTestUser(
      app,
      prisma,
      Role.USER,
    )

    const tenant = await prisma.user.create({
      data: {
        name: 'Tenant',
        email: 'tenant@test.com',
        password: '123',
      },
    })

    const property = await prisma.property.create({
      data: {
        title: 'Casa Teste',
        address: 'Rua X',
        type: 'HOUSE',
        status: 'AVAILABLE',
      },
    })

    const response = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        initialContract: new Date().toISOString(),
        endContract: new Date(Date.now() + 86400000).toISOString(),
        propertyId: property.id,
        userId: tenant.id,
      })

    expect(response.statusCode).toBe(403)
  })

  test('[POST] /contracts - invalid dates', async () => {
    const { token: adminToken } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const tenant = await prisma.user.create({
      data: {
        name: 'Tenant',
        email: 'tenant@test.com',
        password: '123',
      },
    })

    const property = await prisma.property.create({
      data: {
        title: 'Casa Teste',
        address: 'Rua X',
        type: 'HOUSE',
        status: 'AVAILABLE',
      },
    })

    const now = new Date().toISOString()

    const response = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        initialContract: now,
        endContract: now, // igual → inválido
        propertyId: property.id,
        userId: tenant.id,
      })

    expect(response.statusCode).toBe(400)
  })

  test('[POST] /contracts - property unavailable', async () => {
    const { token: adminToken } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const tenant = await prisma.user.create({
      data: {
        name: 'Tenant',
        email: 'tenant@test.com',
        password: '123',
      },
    })

    const property = await prisma.property.create({
      data: {
        title: 'Casa Occupied',
        address: 'Rua Y',
        type: 'HOUSE',
        status: 'OCCUPIED',
      },
    })

    const response = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        initialContract: new Date().toISOString(),
        endContract: new Date(Date.now() + 86400000).toISOString(),
        propertyId: property.id,
        userId: tenant.id,
      })

    expect(response.statusCode).toBe(409)
  })
})
