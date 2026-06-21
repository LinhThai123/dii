import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

const userPublicSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  avatar: true,
  bio: true,
  dateOfBirth: true,
  gender: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }
}
