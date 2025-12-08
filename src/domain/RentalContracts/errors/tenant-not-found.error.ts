export class TenantNotFoundError extends Error {
  constructor() {
    super('TENANT_NOT_FOUND')
  }
}
