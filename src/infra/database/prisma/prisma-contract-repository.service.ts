import { ContractRepository } from '@/domain/Tickets/repositories/contract-repository'
import { PrismaService } from './prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private prisma: PrismaService) {}

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
}
