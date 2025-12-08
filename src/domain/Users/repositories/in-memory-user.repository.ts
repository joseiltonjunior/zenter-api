import { UserRepository, CreateUserData } from './user-repository'
import { User } from '../entities/user'
import { v4 as uuidv4 } from 'uuid'

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((u) => u.email === email)
    return user ?? null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((u) => u.id === id)
    return user ?? null
  }

  async create(data: CreateUserData): Promise<User> {
    const user = new User(
      uuidv4(),
      data.name,
      data.email,
      data.password,
      data.role ?? 'USER',
      new Date(),
    )

    this.items.push(user)

    return user
  }
}
