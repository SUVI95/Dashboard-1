import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  experience?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  education?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  socialLinks?: any;
}

