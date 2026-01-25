import { IsNotEmpty, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ description: 'The bid amount', example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Requested delivery or completion date' })
  @IsOptional()
  @IsDateString()
  req_date?: string;

  @ApiPropertyOptional({ description: 'Proposal message for the job' })
  @IsOptional()
  @IsString()
  message?: string;
}