export class Property {
  constructor(
    public readonly id: string,
    public title: string,
    public type: string,
    public status: string = 'AVAILABLE',
    public address: string,
    public reservedAt?: Date | null,
    public reservedUntil?: Date | null,
    public createdAt: Date = new Date(),
  ) {}
}
