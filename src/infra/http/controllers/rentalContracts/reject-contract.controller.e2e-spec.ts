import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { Role } from '@prisma/client'

describe('Reject contract (E2E)', () => {
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

  it('[POST] /contracts/:id/reject - admin rejects PENDING contract', async () => {
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
      .post(`/contracts/${contract.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Tenant did not meet requirements',
      })

    expect(response.statusCode).toBe(201)

    const updatedContract = await prisma.rentalContract.findUnique({
      where: { id: contract.id },
    })

    expect(updatedContract?.status).toBe('REJECTED')
    expect(updatedContract?.rejectedReason).toBe(
      'Tenant did not meet requirements',
    )

    const updatedProperty = await prisma.property.findUnique({
      where: { id: property.id },
    })

    expect(updatedProperty?.status).toBe('AVAILABLE')
  })

  it('[POST] /contracts/:id/reject - user cannot reject contract', async () => {
    const { token: userToken } = await authenticateTestUser(
      app,
      prisma,
      Role.USER,
    )

    const response = await request(app.getHttpServer())
      .post('/contracts/any-id/reject')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(403)
  })

  it('[POST] /contracts/:id/reject - contract not found', async () => {
    const { token: adminToken } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const response = await request(app.getHttpServer())
      .post('/contracts/non-existent-id/reject')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(404)
  })

  it('[POST] /contracts/:id/reject - invalid contract status', async () => {
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
        status: 'ACTIVE',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'test' })

    expect(response.statusCode).toBe(400)
  })
})
