import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto.'})
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.'}) // Ajustar según política
  password: string;
} 