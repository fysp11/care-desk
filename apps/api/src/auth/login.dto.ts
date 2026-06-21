import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  email!: string;

  password!: string;
}

IsEmail()(LoginDto.prototype, 'email');
IsString()(LoginDto.prototype, 'password');
MinLength(1)(LoginDto.prototype, 'password');
