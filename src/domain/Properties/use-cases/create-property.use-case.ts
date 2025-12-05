import {
  CreatePropertyProps,
  PropertyRepository,
} from '../repositories/property-repository'

export class CreatePropertyUseCase {
  constructor(private repo: PropertyRepository) {}

  async execute(input: CreatePropertyProps) {
    const property = await this.repo.create({
      title: input.title,
      type: input.type,
      address: input.address,
    })

    return property
  }
}
