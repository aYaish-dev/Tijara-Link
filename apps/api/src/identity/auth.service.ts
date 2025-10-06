import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';

import { PrismaService } from '../prisma.service';

type AuthClaims = {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  fullName: string;
};

@Injectable()
export class AuthService {
  private readonly tokenTtlSeconds = 60 * 60; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await verify(user.password, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    const claims: AuthClaims = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(claims, {
      expiresIn: this.tokenTtlSeconds,
    });

    return {
      accessToken,
      tokenType: 'Bearer' as const,
      expiresIn: this.tokenTtlSeconds,
      claims,
    };
  }
}

