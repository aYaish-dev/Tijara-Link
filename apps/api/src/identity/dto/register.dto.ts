import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_MESSAGE =
  'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and symbol.';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  companyName!: string;

  @IsString()
  @IsIn(['buyer', 'seller'])
  role!: 'buyer' | 'seller';

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, { message: PASSWORD_MESSAGE })
  password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  companyCountryCode?: string;
}

