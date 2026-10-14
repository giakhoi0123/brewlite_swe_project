import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() input: RegisterDto) { return this.auth.register(input); }

  @Post('login')
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(input);
    response.cookie('brewlite_session', result.accessToken, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api',
    });
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request & { user: { userId: string; email: string; name: string; loyaltyPoints: number; role: string } }) {
    const { userId, email, name, loyaltyPoints, role } = request.user;
    return { user: { id: userId, email, name, loyaltyPoints, role } };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('brewlite_session', { path: '/api', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return { message: 'Đã đăng xuất' };
  }
}
