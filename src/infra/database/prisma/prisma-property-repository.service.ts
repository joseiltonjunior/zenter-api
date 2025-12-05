import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  PropertyRepository,
  CreatePropertyProps,
} from '@/domain/properties/repositories/property-repository'
import { Property } from '@/domain/properties/entities/property'

@Injectable()
export class PrismaPropertyRepository implements PropertyRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePropertyProps): Promise<Property> {
    const p = await this.prisma.property.create({
      data: {
        title: data.title,
        type: data.type,
        address: data.address,
      },
    })

    return new Property(
      p.id,
      p.title,
      p.type,
      p.status,
      p.address,
      p.reservedAt,
      p.reservedUntil,
      p.createdAt,
    )
  }

  async findById(id: string): Promise<Property | null> {
    const p = await this.prisma.property.findUnique({ where: { id } })
    if (!p) return null

    return new Property(
      p.id,
      p.title,
      p.type,
      p.status,
      p.address,
      p.reservedAt,
      p.reservedUntil,
      p.createdAt,
    )
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } })
  }

  async hasActiveContract(id: string): Promise<boolean> {
    const contract = await this.prisma.rentalContract.findFirst({
      where: { propertyId: id, status: 'ACTIVE' },
    })
    return !!contract
  }
}
