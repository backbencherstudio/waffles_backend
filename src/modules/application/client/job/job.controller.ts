import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './job.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'attachment', maxCount: 10 }, // ✅ multiple
      { name: 'job_photo', maxCount: 1 }, // ✅ single
    ]),
  )
  async createJob(
    @Req() req: any,
    @Body() dto: CreateJobDto,
    @UploadedFiles()
    files: {
      attachment?: Express.Multer.File[];
      job_photo?: Express.Multer.File[];
    },
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User id not found in request');

    const attachments = files?.attachment ?? [];
    const jobPhoto = files?.job_photo?.[0];

    if (!attachments.length) {
      throw new BadRequestException('At least one attachment file is required');
    }

    return this.jobsService.createJob(userId, dto, attachments, jobPhoto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  getAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('q') q = '',
    @Query('status') status?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User id not found in request');
    return this.jobsService.getAllJobs({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      q,
      status,
      userId,
    });
  }

  @Get(':jobId')
  @UseGuards(JwtAuthGuard)
  getSingleJob(@Param('jobId') jobId: string) {
    return this.jobsService.getSingleJob(jobId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  // @Patch(':id/status')
  // changeStatus(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateJobDto,
  // ) {
  //   return this.jobsService.changeStatus(id, dto);
  // }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jobsService.softDelete(id);
  }
}
