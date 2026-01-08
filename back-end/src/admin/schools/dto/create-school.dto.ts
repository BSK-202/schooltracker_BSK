import { 
  IsString, 
  IsNotEmpty, 
  IsArray, 
  ArrayMinSize, 
  ArrayMaxSize, 
  IsNumber, 
  Min, 
  Max,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;
}

class GeomDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  coordinates: [number, number];
}

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => GeomDto)
  geom: GeomDto;
}