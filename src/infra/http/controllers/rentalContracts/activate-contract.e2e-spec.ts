import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { Role } from '@prisma/client'

describe('Activate contract (E2E)', () => {
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
    await prisma.ticketMessage.deleteMany()
    await prisma.ticket.deleteMany()
    await prisma.rentalContract.deleteMany()
    await prisma.property.deleteMany()
    await prisma.user.deleteMany()
  })

  test('[POST] /contracts/:id/activate - admin activates PENDING contract', async () => {
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

    const contract = await prisma.rentalContract.create({
      data: {
        userId: tenant.id,
        propertyId: property.id,
        adminId: admin.id,
        initialContract: new Date(),
        endContract: new Date(Date.now() + 86400000 * 30),
        status: 'PENDING',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(201)
    expect(response.body.status).toBe('ACTIVE')

    const updatedContract = await prisma.rentalContract.findUnique({
      where: { id: contract.id },
    })

    expect(updatedContract?.status).toBe('ACTIVE')
    expect(updatedContract?.activatedAt).not.toBeNull()

    const updatedProperty = await prisma.property.findUnique({
      where: { id: property.id },
    })

    expect(updatedProperty?.status).toBe('OCCUPIED')
  })

  test('[POST] /contracts/:id/activate - user cannot activate', async () => {
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

    const contract = await prisma.rentalContract.create({
      data: {
        userId: tenant.id,
        propertyId: property.id,
        adminId: tenant.id,
        initialContract: new Date(),
        endContract: new Date(Date.now() + 86400000 * 30),
        status: 'PENDING',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/activate`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(response.statusCode).toBe(403)
  })

  test('[POST] /contracts/:id/activate - contract not found', async () => {
    const { token: adminToken } = await authenticateTestUser(
      app,
      prisma,
      Role.ADMIN,
    )

    const response = await request(app.getHttpServer())
      .post(`/contracts/non-existent/activate`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(404)
  })

  test('[POST] /contracts/:id/activate - invalid status', async () => {
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

    // contrato já ativo → invalid status
    const contract = await prisma.rentalContract.create({
      data: {
        userId: tenant.id,
        propertyId: property.id,
        adminId: admin.id,
        initialContract: new Date(),
        endContract: new Date(Date.now() + 86400000 * 30),
        status: 'ACTIVE',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/contracts/${contract.id}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(400)
  })
})
