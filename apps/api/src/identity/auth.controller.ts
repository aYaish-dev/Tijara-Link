import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() dto: { email: string }) {
    // TODO: replace with real JWT; returning a mock token for dev
    return { accessToken: 'dev-token', email: dto.email };
  }
}
