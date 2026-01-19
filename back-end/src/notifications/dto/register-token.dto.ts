// src/notifications/dto/register-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsNotEmpty } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({
    description: 'Expo push token',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  @IsNotEmpty()
  pushToken: string;
}