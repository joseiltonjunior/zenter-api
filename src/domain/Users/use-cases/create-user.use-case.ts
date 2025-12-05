import {
  ResponseCreateUserProps,
  UserRepository,
} from '../repositories/user-repository'
import { CreateUserDTO } from '../dtos/create-user.dto'

import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from '../errors/user-already-exists.error'

export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(input: CreateUserDTO): Promise<ResponseCreateUserProps> {
    const { name, email, password } = input

    const existing = await this.userRepo.findByEmail(email)
    if (existing) {
      throw new UserAlreadyExistsError(email)
    }

    const passwordHash = await hash(password, 8)

    const created = await this.userRepo.create({
      name,
      email,
      password: passwordHash,
    })

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      createdAt: created.createdAt,
      role: created.role,
    }
  }
}
