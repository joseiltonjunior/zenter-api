import { Injectable } from '@nestjs/common'
import {
  UserRepository,
  CreateUserProps,
} from '@/domain/users/repositories/user-repository'
import { PrismaService } from './prisma.service'
import { User } from '@/domain/users/entities/user'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.createdAt,
    )
  }

  async create(data: CreateUserProps): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'USER',
      },
    })
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.createdAt,
    )
  }
}
