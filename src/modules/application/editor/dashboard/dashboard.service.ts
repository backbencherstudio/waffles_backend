import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';

@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService) {}

  // my order
  async getMyOrders(userId: string, paginationDto: PaginationDto) {
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [hiresTotal, hires, biddedJobsTotal, biddedJobs] = await this.prisma.$transaction([
      this.prisma.hire.count({
        where: {
          hire_profile_id: userId,
        },
      }),
      this.prisma.hire.findMany({
        where: {
          hire_profile_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.jOB.count({
        where: {
          bids: {
            some: {
              user_id: userId,
              status: 'ACCEPTED',
            },
          },
        },
      }),
      this.prisma.jOB.findMany({
        where: {
          bids: {
            some: {
              user_id: userId,
              status: 'ACCEPTED',
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          bids: {
            where: {
              user_id: userId,
              status: 'ACCEPTED',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      message: 'Orders retrieved successfully',
      pagination: {
        page,
        limit,
        hiresTotal,
        hiresTotalPages: Math.ceil(hiresTotal / limit),
        biddedJobsTotal,
        biddedJobsTotalPages: Math.ceil(biddedJobsTotal / limit),
      },
      data: {
        hires: hires.map((hire) => ({
          id: hire.id,
          project_title: hire.project_title,
          project_budget: hire.project_budget,
          project_duration: hire.project_duration,
          total_amount: hire.total_amount,
          status: hire.status,
          type: 'DIRECT_HIRE',
        })),
        biddedJobs: biddedJobs.map((job) => ({
          id: job.id,
          project_title: job.job_title,
          project_budget: job.project_budget,
          project_duration: job.project_duration,
          total_amount: job.total_payment,
          status: job.status,
          type: 'BIDDED_JOB',
        })),
      },
    };
  }

}

