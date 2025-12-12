import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { Role } from '@prisma/client'

describe('Cancel contract (E2E)', () => {
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
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()
  })

  it('[POST] /contracts/:id/cancel - admin cancels PENDING contract', async () => {
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
        title: 'Casa',
        address: 'Rua X',
        type: 'HOUSE',
        status: 'RESERVED',
        reservedAt: new Date(),
        reservedUntil: new Date(Date.now() + 86400000),
      },
    })

    const contract = await prisma.rentalContract.create({
      data: {
        userId: tenant.id,
        adminId: admin.id,
        propertyId: property.id,
        initialContract: new Date(),
        endContract: new Date(Date.now() + 86400000 * 30),
        status: 'PENDING',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Tenant requested cancellation',
      })

    expect(response.statusCode).toBe(201)

    const updatedContract = await prisma.rentalContract.findUnique({
      where: { id: contract.id },
    })

    expect(updatedContract?.status).toBe('CANCELED')
    expect(updatedContract?.cancelReason).toBe('Tenant requested cancellation')

    const updatedProperty = await prisma.property.findUnique({
      where: { id: property.id },
    })

    expect(updatedProperty?.status).toBe('AVAILABLE')
  })

  it('[POST] /contracts/:id/cancel - user cannot cancel contract', async () => {
    const { token: userToken } = await authenticateTestUser(
      app,
      prisma,
      Role.USER,
    )

    const response = await request(app.getHttpServer())
      .post('/contracts/any-id/cancel')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(403)
  })

  it('[POST] /contracts/:id/cancel - contract not found', async () => {
    const { token: adminToken } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const response = await request(app.getHttpServer())
      .post('/contracts/non-existent-id/cancel')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(404)
  })

  it('[POST] /contracts/:id/cancel - invalid contract status', async () => {
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
        title: 'Casa',
        address: 'Rua X',
        type: 'HOUSE',
        status: 'AVAILABLE',
      },
    })

    const contract = await prisma.rentalContract.create({
      data: {
        userId: tenant.id,
        adminId: admin.id,
        propertyId: property.id,
        initialContract: new Date(),
        endContract: new Date(Date.now() + 86400000 * 30),
        status: 'REJECTED',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(400)
  })
})
