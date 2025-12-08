export class InvalidContractDatesError extends Error {
  constructor() {
    super('INITIAL_DATE_MUST_BE_BEFORE_END_DATE')
  }
}
