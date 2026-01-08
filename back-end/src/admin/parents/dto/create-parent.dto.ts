// src/parents/dto/create-parent.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsPhoneNumber, 
  IsOptional, 
  IsIn, 
  IsBoolean
} from 'class-validator';

export class CreateParentDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est obligatoire' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  @IsPhoneNumber('MA', { message: 'Numéro de téléphone invalide (format Maroc)' })
  phone: string;

  @IsOptional()
  @IsBoolean()
  @IsIn([true, false], { message: 'Le sexe doit être true (homme) ou false (femme)' })
  sexe?: boolean;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}