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
    const property = await this.prisma.property.create({
      data: {
        title: data.title,
        type: data.type,
        address: data.address,
      },
    })

    return PrismaPropertyMapper.toDomain(property)
  }

  async findById(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) return null
    return PrismaPropertyMapper.toDomain(property)
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

  async reserveProperty(id: string, reservedAt: Date, reservedUntil: Date) {
    const result = await this.prisma.property.updateMany({
      where: { id, status: 'AVAILABLE' },
      data: {
        status: 'RESERVED',
        reservedAt,
        reservedUntil,
      },
    })

    return result.count > 0
  }

  async markAsOccupied(propertyId: string) {
    await this.prisma.property.updateMany({
      where: {
        id: propertyId,
        OR: [{ status: 'RESERVED' }, { status: 'AVAILABLE' }],
      },
      data: {
        status: 'OCCUPIED',
        reservedAt: null,
        reservedUntil: null,
      },
    })
  }

  async markAsAvailable(propertyId: string) {
    await this.prisma.property.updateMany({
      where: { id: propertyId },
      data: {
        status: 'AVAILABLE',
        reservedAt: null,
        reservedUntil: null,
      },
    })
  }
}
