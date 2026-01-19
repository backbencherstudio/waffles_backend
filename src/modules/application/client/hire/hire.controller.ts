import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { HireService } from './hire.service';
import { CreateHireDto } from './dto/create-hire.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('hires')
export class HireController {
  constructor(private readonly hireService: HireService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'attachments', maxCount: 10 },
      { name: 'project_photo', maxCount: 1 },
    ]),
  )
  async create(
    @Req() req: any,
    @Body() dto: CreateHireDto,
    @UploadedFiles()
    files: {
      attachments?: Express.Multer.File[];
      project_photo?: Express.Multer.File[];
    },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User id not found in request');
    const attachments = files?.attachments ?? [];
    const projectPhoto = files?.project_photo?.[0];

    if (!attachments.length) {
      throw new BadRequestException('At least one attachment is required');
    }

    return this.hireService.createHire(userId, dto, attachments, projectPhoto);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('q') q = '',
    @Query('status') status?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User id not found in request');
    return this.hireService.getAllHires({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      q,
      status,
      userId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hireService.getHireById(id);
  }
}
