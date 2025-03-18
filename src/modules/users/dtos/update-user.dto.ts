import { IsString, IsEmail, IsOptional, IsArray, IsUrl, IsObject, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsNumber()
  riskLevel?: number;

  @IsOptional()
  @IsObject()
  extractedData?: {
    platform?: string;
    username?: string;
    profileImage?: string;
    bio?: string;
    email?: string;
    images?: string[];
  };

  @IsOptional()
  @IsString()
  detectedActivity?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  labels?: {
    description: string;
    score: number;
  }[];
}
