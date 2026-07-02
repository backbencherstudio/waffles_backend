import { Injectable } from '@nestjs/common';
import appConfig from 'src/config/app.config';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { JobStatus } from 'src/common/enums/job.enum';

@Injectable()
export class JobService {

  constructor(
    private readonly prisma: PrismaService
  ) {}

  //get all jobs pending job
  async findAll(paginationDto: PaginationDto) {

    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereCondition = {
      status:JobStatus.PENDING,
    };

    

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.jOB.count({ where: whereCondition }),
      this.prisma.jOB.findMany({
        where: whereCondition,
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          job_title: true,
          job_description: true,
          total_payment: true,
          project_duration: true,
          status: true,
          created_at: true,
          skill: true,
          deadline: true,
          job_photo: true,
          user: {
            select: {
              id: true,
              first_name: true,
              location: true,
              created_at: true,
              skills: {
                select: {
                  skill_name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formatData = jobs.map((job) => {
      return {
        id: job.id,
        created_at: job.created_at,
        job_title: job.job_title,
        project_duration: job.project_duration,
        status: job.status,
        deadline: job.deadline,
        job_photo: job.job_photo,
        job_photo_url: job.job_photo
          ? SojebStorage.url(appConfig().storageUrl.jobPhoto + '/' + job.job_photo)
          : null,
        skill: job.skill,
        user_name: job.user?.first_name ?? null,
        user_location: job.user?.location ?? null,
        user_skill: job.user?.skills?.[0]?.skill_name ?? null,
      };
    });

    return {
      success: true,
      message: 'Pending jobs fetched successfully',
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: formatData,
    };
  }

  // browse jobs
  async browseJobs(paginationDto: PaginationDto) {
    
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;  

    const where = {
      deleted_at: null,
      status: 'PENDING' as const,
    };

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.jOB.count({ where }),
      this.prisma.jOB.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          job_title: true,
          job_description: true,
          total_payment: true,
          project_duration: true,
          status: true,
          created_at: true,
          skill: true,
          deadline: true,
          job_photo: true,
          user: {
            select: {
              id: true,
              first_name: true,
              location: true,
              created_at: true,
              skills: {
                select: {
                  skill_name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formatData = jobs.map((job) => {
      return {
        id: job.id,
        created_at: job.created_at,
        job_title: job.job_title,
        project_duration: job.project_duration,
        status: job.status,
        deadline: job.deadline,
        job_photo: job.job_photo,
        job_photo_url: job.job_photo
          ? SojebStorage.url(appConfig().storageUrl.jobPhoto + '/' + job.job_photo)
          : null,
        skill: job.skill,
        user_name: job.user?.first_name ?? null,
        user_location: job.user?.location ?? null,
        user_skill: job.user?.skills?.[0]?.skill_name ?? null,
      };
    });

    return {
      success: true,
      message: 'Pending jobs fetched successfully',
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: formatData,
    };
  }

  // get job details
  async findOne(id: string) {
    const job = await this.prisma.jOB.findFirst({
      where: { id, deleted_at: null },
      include: {
        bids: {
          where: { deleted_at: null },
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
          orderBy: { created_at: 'desc' },
        },
        user: {
          select: {
            id: true,
            first_name: true,
            location: true,
            avatar: true,
            created_at: true,
            skills: {
              select: {
                skill_name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return {
        success: false,
        message: 'Job not found',
      };
    }

    let remainingTimeMs = null;
    let isLate = false;

    if (job.status === 'IN_PROGRESS' && job.deadline) {
      const now = new Date().getTime();
      const deadlineTime = new Date(job.deadline).getTime();
      remainingTimeMs = deadlineTime - now;

      if (remainingTimeMs < 0) {
        isLate = true;
        remainingTimeMs = 0;
      }
    }

    const formattedBids = job.bids.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      message: bid.message,
      req_date: bid.req_date,
      created_at: bid.created_at,
      status: bid.status,
      user: {
        ...bid.user,
        avatar: bid.user?.avatar
          ? SojebStorage.url(appConfig().storageUrl.avatar + bid.user.avatar)
          : null,
      },
    }));

    return {
      success: true,
      message: 'Job fetched successfully',
      data: {
        ...job,
        job_photo: job.job_photo
          ? SojebStorage.url(appConfig().storageUrl.jobPhoto + '/' + job.job_photo)
          : null,
        user: {
          ...job.user,
          avatar: job.user?.avatar
            ? SojebStorage.url(appConfig().storageUrl.avatar + job.user.avatar)
            : null,
        },
        user_skill: job.user?.skills?.[0]?.skill_name ?? null,
        bids: formattedBids,
        countdown: {
          remaining_ms: remainingTimeMs,
          is_late: isLate,
          deadline: job.deadline,
        },
      },
    };
  }      

  // browse jobs with bid
  // async browseJobsWithBid(paginationDto: PaginationDto) {
   
  //   const page = paginationDto?.page ?? 1;
  //   const limit = paginationDto?.limit ?? 10;
  //   const skip = (page - 1) * limit;

  //   const where = {
  //     deleted_at: null,
  //     status: 'PENDING' as const,
  //   };

  //   const [total, jobs] = await this.prisma.$transaction([
  //     this.prisma.jOB.count({ where }),
  //     this.prisma.jOB.findMany({  

  //       where,
  //       orderBy: {
  //         created_at: 'desc',
  //       },
  //       skip,
  //       take: limit,
  //       include: {
  //         bids: {
  //           where: { deleted_at: null },
  //           include: {
  //             user: {
  //               select: {   
  //                 id: true,
  //                 name: true,
  //                 email: true,    
  //             avatar: true,
  //               },
  //             },
  //           },
  //           orderBy: { created_at: 'desc' },
  //         },
  //         user: {
  //           select: {
  //             id: true,       
  //             first_name: true,
  //             location: true,
  //             created_at: true,
  //             skills: {
  //               select: {
  //                 skill_name: true,
  //               },
  //             },
  //           },  
  //         },
  //       },
  //     }),
  //   ]);

  //   const formatData = jobs.map((job) => {
  //     const formattedBids = job.bids.map((bid) => ({
  //       id: bid.id,
  //       amount: bid.amount,
  //       message: bid.message,
  //       req_date: bid.req_date,
  //       created_at: bid.created_at,
  //       status: bid.status,
  //       user: {
  //         ...bid.user,
  //         avatar: bid.user?.avatar
  //           ? SojebStorage.url(appConfig().storageUrl.avatar + bid.user.avatar)
  //           : null,
  //       },
  //     }));

  //     return {
  //       id: job.id,
  //       created_at: job.created_at,
  //       job_title: job.job_title,
  //       project_duration: job.project_duration,
  //       status: job.status,
  //       deadline: job.deadline,
  //       job_photo: job.job_photo,
  //       job_photo_url: job.job_photo
  //         ? SojebStorage.url(appConfig().storageUrl.jobPhoto + '/' + job.job_photo)
  //         : null,u
  //       user_name: job.user?.first_name ?? null,
  //       user_location: job.user?.location ?? null,
  //       user_skill: job.user?.skills?.[0]?.skill_name ?? null,
  //       bids: formattedBids,
  //     };
  //   }
  //   );

  //   return {
  //     success: true,
  //     message: 'Pending jobs with bids fetched successfully',
  //     pagination: {
  //       page,
  //       limit,
  //       total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //     data: formatData,
  //   };
  // } 
  
  
 

 




    
    


  
}
