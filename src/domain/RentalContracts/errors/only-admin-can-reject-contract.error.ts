export class OnlyAdminCanRejectContractError extends Error {
  constructor() {
    super('Only admins can reject contracts.')
  }
}
