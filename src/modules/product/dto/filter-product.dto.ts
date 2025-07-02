import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit?: number = 20;
}
