import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ContentLength,
  SoftwarePreference,
  VideoCategory,
} from 'prisma/generated';

export class CreateHireDto {
  @IsString()
  projectTitle: string;

  @IsEnum(VideoCategory)
  videoCategory: VideoCategory;

  @IsEnum(ContentLength)
  videoDuration: ContentLength;

  @IsString()
  description: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  projectBudget: number;

  @IsString()
  projectDuration: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  totalAmount: number;

  @IsArray()
  @IsEnum(SoftwarePreference, { each: true })
  @IsOptional()
  softwarePreference?: SoftwarePreference[];
}
