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

  @ApiProperty({
    description: 'Device identifier',
    example: 'ABC123DEF456',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Platform',
    enum: ['ios', 'android', 'web'],
    example: 'android',
  })
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';

  @ApiProperty({
    description: 'App version',
    required: false,
    example: '1.0.0',
  })
  @IsString()
  @IsOptional()
  appVersion?: string;

  @ApiProperty({
    description: 'Device model',
    required: false,
    example: 'SM-G991B',
  })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiProperty({
    description: 'OS version',
    required: false,
    example: '14',
  })
  @IsString()
  @IsOptional()
  osVersion?: string;
}