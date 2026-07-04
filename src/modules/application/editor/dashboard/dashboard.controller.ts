import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_TYPES } from 'src/common/swagger/swagger-auth';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@ApiTags('**Editor Dashboard**')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(USER_TYPES.EDITOR)
@Controller('editor/dashboard')
export class DashboardController {

  constructor(private readonly dashboardService: DashboardService) { }

  // my order
  @Get('my-orders')
  @ApiOperation({ 
    summary: 'Get all my orders',
    description: 'Get all my orders',
   })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved all my orders',
    schema: {
      example: {
        success: true,
        message: 'Orders retrieved successfully',
        pagination: {
          page: 1,
          limit: 10,
          hiresTotal: 1,
          hiresTotalPages: 1,
          biddedJobsTotal: 1,
          biddedJobsTotalPages: 1,
        },
        data: {
          hires: [
            {
              id: 'hire-id-123',
              project_title: 'Video Editing Project',
              project_budget: 150,
              project_duration: '3 days',
              total_amount: 150,
              status: 'IN_PROGRESS',
              type: 'DIRECT_HIRE'
            }
          ],
          biddedJobs: [
            {
              id: 'job-id-789',
              project_title: 'Commercial Ads Video',
              project_budget: 300,
              project_duration: '5 days',
              total_amount: 300,
              status: 'IN_PROGRESS',
              type: 'BIDDED_JOB'
            }
          ]
        }
      }
    }
   }) 
  async getMyOrders(
    @Req() req: any,
    @Query() paginationDto: PaginationDto
  ) {
    const userId = req.user.userId;
    return await this.dashboardService.getMyOrders(userId, paginationDto);
  }


  // 



}
