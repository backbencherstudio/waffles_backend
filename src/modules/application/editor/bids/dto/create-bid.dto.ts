import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBidDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'Requested delivery or completion date' })
  @IsOptional()
  @IsDateString()
  req_date?: string;

  @ApiPropertyOptional({ description: 'Proposal message for the job' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Proposal attachments' })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiProperty({ description: 'Bid status' })
  @IsNotEmpty()
  @IsString()
  status: string;
}
