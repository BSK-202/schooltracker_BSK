// src/admin/trajets/dto/create-trajet.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsEnum, 
  IsBoolean, 
  IsOptional,
  Matches,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypeTrajet } from '../entities/trajet.entity';

export class CreateStopTrajetDto {
  @IsInt()
  @Min(1)
  stopId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  scheduled_time: string;
}

export class CreateTrajetDto {
  @IsInt()
  @IsNotEmpty({ message: 'L\'ID du bus est obligatoire' })
  @Min(1, { message: 'L\'ID du bus doit être supérieur à 0' })
  busId: number;

  @IsString()
  @IsNotEmpty({ message: 'Le nom du trajet est obligatoire' })
  nom: string;

  @IsEnum(TypeTrajet, { message: 'Le type doit être PICKUP ou DROPOFF' })
  @IsNotEmpty({ message: 'Le type est obligatoire' })
  type: TypeTrajet;

  @IsString()
  @IsNotEmpty({ message: 'L\'heure de début est obligatoire' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'heure_debut doit être au format HH:MM:SS'
  })
  heure_debut: string;

  @IsString()
  @IsNotEmpty({ message: 'L\'heure de fin est obligatoire' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'heure_fin doit être au format HH:MM:SS'
  })
  heure_fin: string;

  @IsOptional()
  @IsBoolean()
  is_actif?: boolean;

  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un arrêt doit être sélectionné' })
  @ValidateNested({ each: true })
  @Type(() => CreateStopTrajetDto)
  stops: CreateStopTrajetDto[];
}