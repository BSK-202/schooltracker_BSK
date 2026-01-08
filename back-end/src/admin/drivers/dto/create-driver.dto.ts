// src/admin/drivers/dto/create-driver.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  full_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  @Matches(/^\+212[0-9]{9}$/, {
    message: 'Le téléphone doit être au format: +212612345678'
  })
  phone: string;

  @IsInt({ message: "L'ID de l'école doit être un nombre" })
  @IsNotEmpty({ message: "L'ID de l'école est obligatoire" })
  schoolId: number; // ← NOUVEAU : École obligatoire

  @IsOptional()
  @IsInt({ message: "L'ID du bus doit être un nombre" })
  busId?: number; // ← Toujours optionnel
}