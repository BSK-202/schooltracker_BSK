// src/admin/stops/dto/reorder-all-stops.dto.ts
import { IsArray, IsInt } from 'class-validator';

export class ReorderAllStopsDto {
  @IsArray()
  @IsInt({ each: true })
  stopIds: number[];
}