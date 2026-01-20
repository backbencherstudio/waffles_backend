import { PartialType } from '@nestjs/swagger';
import { CreateDepositeDto } from './create-deposite.dto';

export class UpdateDepositeDto extends PartialType(CreateDepositeDto) {}
