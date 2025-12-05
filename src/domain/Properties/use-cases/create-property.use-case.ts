import { CreatePropertyDTO } from '../dtos/create-property.dto'
import { PropertyRepository } from '../repositories/property-repository'

export class CreatePropertyUseCase {
  constructor(private repo: PropertyRepository) {}

  async execute(input: CreatePropertyDTO) {
    const property = await this.repo.create({
      title: input.title,
      type: input.type,
      address: input.address,
    })

    return property
  }
}
