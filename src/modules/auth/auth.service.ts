import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@database/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthPayload } from '@common/types/auth';

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
      throw new NotFoundException();
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
    console.log(payload);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(user: Partial<User>): Promise<User> {
    const existedUser = await this.userService.findOneByEmail(user.email);

    if (existedUser) {
      throw new BadRequestException('User already exists');
    }
    return this.userService.create(user);
  }

  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException();
    }

    console.log('get user profile', user);

    return {
      id: user.id,
      email: user.email,
    };
  }
}
