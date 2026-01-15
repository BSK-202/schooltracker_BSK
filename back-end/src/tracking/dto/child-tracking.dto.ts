// src/tracking/dto/child-tracking.dto.ts
import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class BusInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  licencePlate: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

class StopInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class ChildTrackingDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsObject()
  @IsOptional()
  bus?: BusInfoDto;

  @IsObject()
  stop: StopInfoDto;

  @IsString()
  @IsOptional()
  qrCode?: string;

  @IsString()
  @IsOptional()
  busText?: string;
}