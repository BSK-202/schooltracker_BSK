// src/tracking/dto/route-stop.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class RouteStopDto {
  @IsNumber()
  id: number;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  order: number;

  @IsString()
  scheduledTime: string;

  @IsString()
  @IsOptional()
  type?: string; // PICKUP ou DROPOFF
}