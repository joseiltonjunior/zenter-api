import { User } from '../entities/user'

export type CreateUserData = {
  name: string
  email: string
  password: string
}

export interface ResponseCreateUserProps {
  createdAt: Date
  name: string
  email: string
  role: string
  id: string
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

export const UserRepositoryToken = Symbol('UserRepository')
