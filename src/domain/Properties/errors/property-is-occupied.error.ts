export class PropertyIsOccupiedError extends Error {
  constructor(propertyId: string) {
    super(`Property ${propertyId} is currently occupied and cannot be deleted.`)
    this.name = 'PropertyIsOccupiedError'
  }
}
