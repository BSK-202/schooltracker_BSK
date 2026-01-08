// src/students/dto/update-student.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsInt, 
  IsBoolean 
} from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  parent1Id?: number | null;

  @IsOptional()
  @IsInt()
  parent2Id?: number | null;

  @IsOptional()
  @IsInt()
  stopId?: number;
}