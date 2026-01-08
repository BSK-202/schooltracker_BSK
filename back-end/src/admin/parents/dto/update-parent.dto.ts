// src/parents/dto/update-parent.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsPhoneNumber, 
  IsIn,
  IsBoolean
} from 'class-validator';

export class UpdateParentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('MA', { message: 'Numéro de téléphone invalide (format Maroc)' })
  phone?: string;

  @IsOptional()
  @IsBoolean()
  @IsIn([true, false], { message: 'Le sexe doit être true (homme) ou false (femme)' })
  sexe?: boolean;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}