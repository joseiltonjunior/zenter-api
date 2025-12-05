import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreatePropertyData,
  PropertyRepository,
} from '@/domain/properties/repositories/property-repository'
import { PrismaPropertyMapper } from './mappers/prisma-property.mapper'

@Injectable()
export class PrismaPropertyRepository implements PropertyRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePropertyData) {
    const p = await this.prisma.property.create({
      data: {
        title: data.title,
        type: data.type,
        address: data.address,
      },
    })

    return PrismaPropertyMapper.toDomain(p)
  }

  async findById(id: string) {
    const p = await this.prisma.property.findUnique({ where: { id } })
    if (!p) return null
    return PrismaPropertyMapper.toDomain(p)
  }

  async delete(id: string) {
    await this.prisma.property.delete({ where: { id } })
  }

  async hasActiveContract(id: string) {
    const contract = await this.prisma.rentalContract.findFirst({
      where: { propertyId: id, status: 'ACTIVE' },
    })
    return !!contract
  }
}
