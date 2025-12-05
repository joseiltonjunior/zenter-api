export class PropertyNotFoundError extends Error {
  constructor(id: string) {
    super(`Property not found: ${id}`)
    this.name = 'PropertyNotFoundError'
  }
}
