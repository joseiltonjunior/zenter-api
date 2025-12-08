export class OnlyAdminCanCreateContractError extends Error {
  constructor() {
    super('ONLY_ADMIN_CAN_CREATE_CONTRACT')
  }
}
