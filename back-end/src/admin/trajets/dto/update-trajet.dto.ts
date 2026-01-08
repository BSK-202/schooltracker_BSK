// src/admin/trajets/dto/update-trajet.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsInt, 
  IsEnum, 
  IsBoolean,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNotEmpty,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypeTrajet } from '../entities/trajet.entity';

export class UpdateStopTrajetDto {
  @IsInt()
  @Min(1)
  stopId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  scheduled_time: string;
}

export class UpdateTrajetDto {
  @IsOptional()
  @IsInt()
  busId?: number;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEnum(TypeTrajet)
  type?: TypeTrajet;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  heure_debut?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  heure_fin?: string;

  @IsOptional()
  @IsBoolean()
  is_actif?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateStopTrajetDto)
  stops?: UpdateStopTrajetDto[];
}