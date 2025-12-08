import { RentalContract as PrismaRentalContract } from '@prisma/client'
import { RentalContract } from '@/domain/RentalContracts/entities/rental-contract'

export class PrismaRentalContractMapper {
  static toDomain(raw: PrismaRentalContract): RentalContract {
    return new RentalContract(
      raw.id,
      raw.userId,
      raw.propertyId,
      raw.adminId,
      raw.initialContract,
      raw.endContract,
      raw.status,
      raw.createdAt,
      raw.activatedAt,
      raw.cancelledAt,
      raw.rejectedAt,
      raw.expiredAt,
      raw.cancelReason,
      raw.rejectedReason,
    )
  }

  static toPrisma(entity: RentalContract) {
    return {
      id: entity.id,
      userId: entity.userId,
      propertyId: entity.propertyId,
      adminId: entity.adminId,
      initialContract: entity.initialContract,
      endContract: entity.endContract,
      status: entity.status,
      createdAt: entity.createdAt,
      activatedAt: entity.activatedAt,
      cancelledAt: entity.cancelledAt,
      rejectedAt: entity.rejectedAt,
      expiredAt: entity.expiredAt,
      cancelReason: entity.cancelReason,
      rejectedReason: entity.rejectedReason,
    }
  }
}
