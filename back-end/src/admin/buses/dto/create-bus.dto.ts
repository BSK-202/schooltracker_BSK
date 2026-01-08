// src/admin/buses/dto/create-bus.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  Max, 
  IsOptional, 
  IsBoolean 
} from 'class-validator';

export class CreateBusDto {
  @IsInt()
  @IsNotEmpty()
  schoolId: number;

  @IsString()
  @IsNotEmpty()
  licence_plate: string;

  @IsInt()
  @Min(10)
  @Max(60)
  capacity: number;

  @IsInt()
  @IsNotEmpty({ message: "L'ID du chauffeur est obligatoire" })
  driverId: number; // ← CHANGÉ: Rendue OBLIGATOIRE (pas de ?)

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  photo_url?: string;
}