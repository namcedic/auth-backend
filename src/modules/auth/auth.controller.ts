import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '@database/entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { AuthPayload } from '@common/types/auth';
import { CurrentUser } from '@common/decorators/user.decorator';
import { RefreshTokenInput } from '@modules/auth/dto/requests/refresh-token.input';

interface AuthedRequest extends ExpressRequest {
  user: AuthPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: Partial<User>) {
    return this.authService.register(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: AuthedRequest) {
    console.log('login', req.user);
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@CurrentUser() user: AuthPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Post('/refresh-token')
  async refreshToken(@Body() input: RefreshTokenInput) {
    return this.authService.refreshToken(input);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout() {
    // add logic
    return true;
  }
}
