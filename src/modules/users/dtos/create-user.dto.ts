import { IsString, IsEmail, IsOptional, IsArray, IsUrl, IsObject, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsNumber()
  riskLevel?: number;

  @IsOptional()
  @IsObject()
  extractedData?: {
    platform: string;
    username: string;
    profileImage: string;
    bio: string;
    email: string;
    images: string[];
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
