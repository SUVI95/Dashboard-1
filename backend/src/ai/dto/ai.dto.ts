import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class GenerateCoverLetterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  cvId?: string;

  @ApiProperty({ example: 'We are looking for a senior software engineer...' })
  @IsString()
  jobText: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiProperty({ example: 'professional', enum: ['professional', 'friendly', 'formal', 'creative'] })
  @IsEnum(['professional', 'friendly', 'formal', 'creative'])
  @IsOptional()
  tone?: string = 'professional';
}

export class GenerateInterviewPrepDto {
  @ApiProperty({ example: 'Senior Software Engineer job description...' })
  @IsString()
  jobDescription: string;
}

