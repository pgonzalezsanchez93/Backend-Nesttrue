import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;


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
}