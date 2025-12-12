export class OnlyAdminCanActivateContractError extends Error {
  constructor() {
    super('Only admins can activate contracts.')
  }
}
