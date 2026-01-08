// src/admin/stops/dto/reorder-stop.dto.ts
import { IsInt, Min } from 'class-validator';

export class ReorderStopDto {
  @IsInt()
  @Min(1)
  newOrder: number;
}