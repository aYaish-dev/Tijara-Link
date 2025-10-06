import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';

import { PrismaService } from '../prisma.service';

type PrismaRole = 'ADMIN' | 'BUYER' | 'SUPPLIER' | 'AGENT';

type AuthUser = {
  id: string;
  email: string;
  role: PrismaRole;
  companyId: string;
  fullName: string;
  password: string;
};

type AuthClaims = {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  fullName: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role: 'buyer' | 'seller';
  companyCountryCode?: string;
};

@Injectable()
export class AuthService {
  private readonly tokenTtlSeconds = 60 * 60; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private mapRole(role: 'buyer' | 'seller'): PrismaRole {
    return role === 'seller' ? 'SUPPLIER' : 'BUYER';
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async validateCredentials(email: string, password: string): Promise<AuthUser> {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userRecord = user as AuthUser;

    const valid = await verify(userRecord.password, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return userRecord;
  }

  private async buildAuthResponse(user: AuthUser) {
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

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    return this.buildAuthResponse(user);
  }

  async register(payload: RegisterPayload) {
    const email = this.normalizeEmail(payload.email);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const role = this.mapRole(payload.role);
    const hashedPassword = await hash(payload.password);

    const { user } = await this.prisma.$transaction(async (tx: PrismaService) => {
      const company = await tx.company.create({
        data: {
          legalName: payload.companyName.trim(),
          countryCode: (payload.companyCountryCode || 'AE').toUpperCase(),
        },
      });

      const createdUser = await tx.user.create({
        data: {
          email,
          fullName: payload.fullName.trim(),
          role,
          password: hashedPassword,
          companyId: company.id,
        },
      });

      return { user: createdUser as AuthUser };
    });

    return this.buildAuthResponse(user);
  }
}

