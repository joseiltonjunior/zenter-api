export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: 'ADMIN' | 'USER' = 'USER',
    public createdAt: Date = new Date(),
  ) {}
}
