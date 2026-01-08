// src/admin/stops/dto/update-stop.dto.ts
import { 
  IsString, 
  IsOptional,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';

export class UpdateStopDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  coordinates?: [number, number];
}