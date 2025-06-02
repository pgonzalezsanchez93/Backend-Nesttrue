import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/,
    {
      message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    }
  )
  password: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}