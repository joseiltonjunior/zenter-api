export class Ticket {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: string,
    public userId: string,
    public propertyId: string | null,
    public createdAt: Date = new Date(),
  ) {}
}
