import { Injectable } from '@nestjs/common'
import {
  UserRepository,
  CreateUserData,
} from '@/domain/users/repositories/user-repository'
import { PrismaService } from './prisma.service'
import { PrismaUserMapper } from './mappers/prisma-user.mapper'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return PrismaUserMapper.toDomain(user)
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return PrismaUserMapper.toDomain(user)
  }

  async create(data: CreateUserData) {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'USER',
      },
    })

    return PrismaUserMapper.toDomain(user)
  }
}
