// src/admin/stops/dto/create-stop.dto.ts
import { 
  IsString, 
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';

export class CreateStopDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'adresse est obligatoire' })
  address: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Les coordonnées doivent être [longitude, latitude]' })
  @ArrayMaxSize(2, { message: 'Les coordonnées doivent être [longitude, latitude]' })
  coordinates: [number, number];
}