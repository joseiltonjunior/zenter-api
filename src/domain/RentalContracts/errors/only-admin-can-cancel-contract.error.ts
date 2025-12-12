export class OnlyAdminCanCancelContractError extends Error {
  constructor() {
    super('Only admins can cancel contracts.')
  }
}
