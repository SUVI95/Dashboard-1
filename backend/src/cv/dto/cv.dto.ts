import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class FixCvDto {
  @ApiProperty({ 
    example: 'ATS', 
    description: 'Goal for CV optimization',
    enum: ['ATS', 'senior_engineer', 'compact', 'creative'] 
  })
  @IsEnum(['ATS', 'senior_engineer', 'compact', 'creative'])
  goal: string;

  @ApiProperty({ example: 'Focus on leadership experience', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TranslateCvDto {
  @ApiProperty({ example: 'Finnish', description: 'Target language' })
  @IsString()
  targetLanguage: string;
}

