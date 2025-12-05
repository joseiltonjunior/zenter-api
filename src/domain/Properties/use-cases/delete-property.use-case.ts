import { PropertyHasActiveContractError } from '../errors/property-has-active-contract.error'
import { PropertyIsOccupiedError } from '../errors/property-is-occupied.error'
import { PropertyNotFoundError } from '../errors/property-not-found.error'
import { PropertyRepository } from '../repositories/property-repository'

export class DeletePropertyUseCase {
  constructor(private repo: PropertyRepository) {}

  async execute(input: { id: string }) {
    const property = await this.repo.findById(input.id)
    if (!property) throw new PropertyNotFoundError(input.id)

    const hasActiveContract = await this.repo.hasActiveContract(input.id)
    if (hasActiveContract) throw new PropertyHasActiveContractError(input.id)

    if (property.status === 'OCCUPIED') {
      throw new PropertyIsOccupiedError(input.id)
    }

    await this.repo.delete(input.id)
  }
}
