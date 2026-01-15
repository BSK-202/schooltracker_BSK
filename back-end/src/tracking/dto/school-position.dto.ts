// src/tracking/dto/school-position.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class SchoolPositionDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}