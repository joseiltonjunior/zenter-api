import { ContractRepository } from './contract-repository'

export class InMemoryContractRepository implements ContractRepository {
  private activeContracts = new Set<string>()

  markActive(userId: string, propertyId: string) {
    this.activeContracts.add(`${userId}:${propertyId}`)
  }

  async userHasActiveContract(userId: string, propertyId: string) {
    return this.activeContracts.has(`${userId}:${propertyId}`)
  }
}
