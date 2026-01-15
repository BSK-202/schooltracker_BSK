// src/auth/dto/login.dto.ts
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  @Matches(/^\+212[0-9]{9}$/, {
    message: 'Le téléphone doit être au format: +212612345678'
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}