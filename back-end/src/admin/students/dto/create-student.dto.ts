// src/students/dto/create-student.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est obligatoire' })
  fullName: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  parent1Id?: number;

  @IsOptional()
  @IsInt()
  parent2Id?: number;

  @IsInt()
  @IsNotEmpty({ message: "L'arrêt est obligatoire" })
  stopId: number;
}