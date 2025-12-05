import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { authenticateTestUser } from '@/utils/authenticate'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PropertyStatus, Role } from '@prisma/client'
import request from 'supertest'

describe('Delete property (E2E)', () => {
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

  test('[DELETE] /properties/:id - cannot delete OCCUPIED property', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const property = await prisma.property.create({
      data: {
        title: 'Casa Ocupada',
        type: 'HOUSE',
        status: PropertyStatus.OCCUPIED,
        address: 'Rua Teste 22',
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(409)
  })

  test('[DELETE] /properties/:id - admin can delete available property', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.ADMIN)

    const property = await request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Casa A',
        address: 'R. Iolanda Rodrigues Sobral, 6 - Iputinga, Recife - PE',
        type: 'HOUSE',
      })

    const response = await request(app.getHttpServer())
      .delete(`/properties/${property.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      message: 'Property deleted successfully.',
    })

    const check = await prisma.property.findUnique({
      where: { id: property.body.id },
    })
    expect(check).toBeNull()
  })

  test('[DELETE] /properties/:id - user cannot delete', async () => {
    const { token } = await authenticateTestUser(app, prisma, Role.USER)

    const property = await prisma.property.create({
      data: {
        title: 'Casa do User',
        type: 'HOUSE',
        status: PropertyStatus.AVAILABLE,
        address: 'Rua Teste 33',
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(403)
  })
})
