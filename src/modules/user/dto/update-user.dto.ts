import { IsDate, IsOptional, IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @Length(1, 30)
  @Expose()
  readonly firstName: string;

  @IsString()
  @Length(1, 30)
  @Expose()
  @IsOptional()
  readonly middleName?: string;

  @IsString()
  @Length(1, 30)
  @Expose()
  readonly lastName: string;

  @IsString()
  @IsDate()
  @Expose()
  @IsOptional()
  readonly birthDate: string;

  @IsString()
  @Length(1, 15)
  @Expose()
  @IsOptional()
  readonly number: string;

  @IsString()
  @Length(1, 500)
  @Expose()
  @IsOptional()
  readonly description?: string;
}
