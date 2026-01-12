import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './job.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('attachment'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateJobDto,
    @Req() req,
  ) {
    console.log(req.user);
    return this.jobsService.createJob(req.user.userId, dto, file);
  }

  @Get('cards')
  getJobCards() {
    return this.jobsService.findAllCards();
  }

  @Get('all')
  findAll() {
    return this.jobsService.getAllJobs();
  }

  @Patch(':id')
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
