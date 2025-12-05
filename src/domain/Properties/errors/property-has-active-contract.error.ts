export class PropertyHasActiveContractError extends Error {
  constructor(propertyId: string) {
    super(
      `Property ${propertyId} has an active contract and cannot be deleted.`,
    )
    this.name = 'PropertyHasActiveContractError'
  }
}
