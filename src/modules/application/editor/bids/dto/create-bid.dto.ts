import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  amount?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  req_date?: number; // এটি এখন Float হিসেবে ডাটাবেসে যাবে (যেমন: ৩ দিন)

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  status?: string;
}