import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { USER_TYPES } from 'src/common/swagger/swagger-auth';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@ApiTags('**Editor Job Management**')
@ApiBearerAuth(USER_TYPES.EDITOR)
@UseGuards(JwtAuthGuard)
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /*--------------------------------------------------
              get quick match result
  --------------------------------------------------*/            
  @Get('quick-match')
  @ApiOperation({
    summary: 'Get quick match pending jobs',
    description:
      'Returns the paginated list of jobs that are still in PENDING status for the editor dashboard.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Items per page',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved pending jobs',
    schema: {
      example: {
        success: true,
        message: 'Pending jobs fetched successfully',
        pagination: {
          page: 1,
          limit: 10,
          total: 24,
          totalPages: 3,
        },
        data: [
          {
            id: 'job-id-123',
            created_at: '2026-06-30T09:00:00.000Z',
            job_title:
              'I will do SEO backlinks with blogger outreach for high quality link building',
            job_description:
              'Create quality backlinks and outreach links for better ranking.',
            total_payment: 150,
            project_duration: 5,
            status: 'PENDING',
            deadline: '2026-07-05T09:00:00.000Z',
            skill: 'SEO, Backlink Outreach',
            job_photo: 'job-photo.jpg',
            job_photo_url:
              'https://cdn.example.com/storage/job-photo/job-photo.jpg',
            user_name: 'Marvin McKinney',
            user_location: 'Pakistan',
            user_skill: 'SEO Specialist',
          },
        ],
      },
    },
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.jobService.findAll(paginationDto);
  }

  /*--------------------------------------------------
              browse jobs
  --------------------------------------------------*/            
  @Get('browse-jobs')
  @ApiOperation({
    summary: 'Browse pending jobs',
    description:
      'Returns the paginated browse list of all pending jobs for the editor dashboard.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Items per page',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved browse jobs',
    schema: {
      example: {
        success: true,
        message: 'Pending jobs fetched successfully',
        pagination: {
          page: 1,
          limit: 10,
          total: 24,
          totalPages: 3,
        },
        data: [
          {
            id: 'job-id-123',
            created_at: '2026-06-30T09:00:00.000Z',
            job_title:
              'I will do SEO backlinks with blogger outreach for high quality link building',
            job_description:
              'Create quality backlinks and outreach links for better ranking.',
            total_payment: 150,
            project_duration: 5,
            status: 'PENDING',
            deadline: '2026-07-05T09:00:00.000Z',
            skill: 'SEO, Backlink Outreach',
            job_photo: 'job-photo.jpg',
            job_photo_url:
              'https://cdn.example.com/storage/job-photo/job-photo.jpg',
            user_name: 'Marvin McKinney',
            user_location: 'Pakistan',
            user_skill: 'SEO Specialist',
          },
        ],
      },
    },
  })
  async browseJobs(@Query() paginationDto: PaginationDto) {
    return this.jobService.browseJobs(paginationDto);
  }



  // job deatils
  @Get(':id')
  @ApiOperation({
    summary: 'Get job details',
    description:
      'Returns full details for a single job including owner info, bids, image URL, and countdown data.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved job details',
    schema: {
      example: {
        success: true,
        message: 'Job fetched successfully',
        data: {
          id: 'job-id-123',
          created_at: '2026-06-30T09:00:00.000Z',
          job_title:
            'I will do SEO backlinks with blogger outreach for high quality link building',
          job_description:
            'Create quality backlinks and outreach links for better ranking.',
          total_payment: 150,
          project_duration: 5,
          status: 'PENDING',
          deadline: '2026-07-05T09:00:00.000Z',
          skill: 'SEO, Backlink Outreach',
          job_photo: 'job-photo.jpg',
          job_photo_url:
            'https://cdn.example.com/storage/job-photo/job-photo.jpg',
          user_skill: 'SEO Specialist',
          user: {
            id: 'user-id-456',
            first_name: 'Marvin',
            location: 'Pakistan',
            avatar: 'https://cdn.example.com/storage/avatar/avatar.jpg',
            created_at: '2026-06-25T09:00:00.000Z',
          },
          bids: [],
          countdown: {
            remaining_ms: null,
            is_late: false,
            deadline: '2026-07-05T09:00:00.000Z',
          },
        },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }


  // browse jobs with bid
  // @Get('browse-jobs-with-bid')
  // @ApiOperation({
  //   summary: 'Browse pending jobs with bids',
  //   description:
  //     'Returns the paginated browse list of all pending jobs with bids for the editor dashboard.',
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   example: 1,
  //   description: 'Page number',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   example: 10,
  //   description: 'Items per page',
  // })
  // async browseJobsWithBid(
  //   @Query() paginationDto: PaginationDto
  // ) {
  //   return this.jobService.browseJobsWithBid(paginationDto);
  // }
}
