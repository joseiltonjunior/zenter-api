import { PrismaService } from './prisma.service'
import { Injectable } from '@nestjs/common'
import { RentalContractRepository } from '@/domain/RentalContracts/repositories/rental-contract-repository'
import { CreateRentalContractDTO } from '@/domain/RentalContracts/dtos/create-rental-contract.dto'
import { RentalContract } from '@/domain/RentalContracts/entities/rental-contract'
import { PrismaRentalContractMapper } from './mappers/prisma-rental-contract.mapper'

@Injectable()
export class PrismaRentalContractRepository
  implements RentalContractRepository
{
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRentalContractDTO): Promise<RentalContract> {
    const contract = await this.prisma.rentalContract.create({
      data: {
        userId: data.userId,
        propertyId: data.propertyId,
        adminId: data.adminId,
        initialContract: data.initialContract,
        endContract: data.endContract,
      },
    })

    return PrismaRentalContractMapper.toDomain(contract)
  }

  async findById(id: string) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id },
    })

    return contract ? PrismaRentalContractMapper.toDomain(contract) : null
  }

  async userHasActiveContract(userId: string, propertyId: string) {
    const contract = await this.prisma.rentalContract.findFirst({
      where: {
        userId,
        propertyId,
        status: 'ACTIVE',
      },
    })
    return !!contract
  }

  async activate(id: string): Promise<RentalContract | null> {
    const contract = await this.prisma.rentalContract.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    })

    return PrismaRentalContractMapper.toDomain(contract)
  }
}
