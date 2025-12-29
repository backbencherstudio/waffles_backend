import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: ['Adobe After Effects', 'Avid Media Composer'] })
  @IsNotEmpty()
  @IsArray()
  skill_name: string[];
}
