export class InvalidContractStatusError extends Error {
  constructor() {
    super('Only PENDING contracts can be activated.')
  }
}
