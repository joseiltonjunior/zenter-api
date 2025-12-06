export interface ContractRepository {
  userHasActiveContract(userId: string, propertyId: string): Promise<boolean>
}

export const ContractRepositoryToken = Symbol('ContractRepository')
