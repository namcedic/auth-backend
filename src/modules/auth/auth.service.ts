import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@database/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthPayload } from '@common/types/auth';
import { RefreshTokenInput } from '@modules/auth/dto/requests/refresh-token.input';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Partial<User> | null> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('Invalid user email or password');
    }

    if (user && (await user.comparePassword(pass))) {
      return {
        id: user.id,
        email: user.email,
      } as Partial<User>;
    }
    return null;
  }

  login(user: AuthPayload) {
    const payload = { email: user.email, sub: user.id };
    return this.generateTokens(payload);
  }

  async register(user: Partial<User>): Promise<any> {
    const existedUser = await this.userService.findOneByEmail(user.email);

    if (existedUser) {
      throw new BadRequestException('User already exists');
    }
    this.userService.create(user);

    return {
      success: true,
    };
  }

  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async refreshToken(input: RefreshTokenInput) {
    const authPayload: AuthPayload = await this.verifyRefreshToken(
      input.refreshToken,
    );

    if (!authPayload) {
      throw new BadRequestException('Invalid token');
    }

    const existedUser = await this.userService.findOne(authPayload.sub);

    if (!existedUser) {
      throw new BadRequestException('User does not exist');
    }

    return await this.generateTokens({ ...authPayload });
  }

  async generateTokens(payload: {
    sub: number;
    email: string;
    exp?: number;
    iat?: number;
  }) {
    if (payload.exp) delete payload.exp;
    if (payload.iat) delete payload.iat;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthPayload> {
    try {
      return await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Invalid access token:', error);
    }
  }

  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      return await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Invalid refresh token:', error);
    }
  }
}
