import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/,
    {
      message: 'La nueva contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    }
  )
  newPassword?: string;
}