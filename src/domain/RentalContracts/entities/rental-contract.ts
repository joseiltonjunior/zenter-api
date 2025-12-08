export class RentalContract {
  constructor(
    public readonly id: string,
    public userId: string,
    public propertyId: string,
    public adminId: string,
    public initialContract: Date,
    public endContract: Date,
    public status: string = 'PENDING',
    public createdAt: Date = new Date(),
    public activatedAt: Date | null = null,
    public cancelledAt: Date | null = null,
    public rejectedAt: Date | null = null,
    public expiredAt: Date | null = null,
    public cancelReason: string | null = null,
    public rejectedReason: string | null = null,
  ) {}
}
