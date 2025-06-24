import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenInput {
  // @IsString()
  // @IsNotEmpty()
  refreshToken: string;
}
