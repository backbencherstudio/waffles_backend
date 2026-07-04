import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import * as natural from 'natural';
import { JobStatus } from 'src/common/enums/job.enum';
import { calculateSkillMatch } from 'src/common/utils/skill-matcher.util';
import { ImageGetUtil } from 'src/common/utils/image/image.util';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  /*-------------------------------------------------------
                  get all jobs pending job
  -------------------------------------------------------*/

  async quickMatch(paginationDto: PaginationDto, editorId: string) {
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;

    const editor = await this.prisma.user.findUnique({
      where: { id: editorId },
      select: { skills: { select: { skill_name: true } } },
    });

    const editorSkills = (editor?.skills ?? []).map((s) =>
      s.skill_name.toLowerCase().trim(),
    );

    const jobs = await this.prisma.jOB.findMany({
      where: { status: JobStatus.PENDING },
      orderBy: { created_at: 'desc' },
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
            created_at: true,
            first_name: true,
            avatar: true,
            last_name: true,
            location: true,
            skills: { select: { skill_name: true } },
          },
        },
      },
    });

    const formattedAndMatchedJobs = jobs.map((job) => ({
      id: job.id,
      job_title: job.job_title,
      job_photo: job.job_photo,
      job_photo_url: ImageGetUtil.jobPhotoUrl(job.job_photo),
      user_name: `${job.user?.first_name ?? null} ${job.user?.last_name ?? null}`,
      user_photo: job.user?.avatar,
      user_photo_url: ImageGetUtil.avatarUrl(job.user?.avatar),
      skill: job.skill,
      exprience: job.user.created_at,
      location: job.user.location,
      total_payment: job.total_payment,
      project_duration: job.project_duration,
      match_percentage: calculateSkillMatch(job.skill, editorSkills),
    }));

    formattedAndMatchedJobs.sort(
      (a, b) => b.match_percentage - a.match_percentage,
    );

    const total = formattedAndMatchedJobs.length;
    const paginatedData = formattedAndMatchedJobs.slice(skip, skip + limit);

    return {
      success: true,
      message: 'Pending jobs fetched successfully with fuzzy match',
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: paginatedData,
    };
  }

  /*-------------------------------------------------------
                  browse jobs pending job
  -------------------------------------------------------*/

  async browseJobs(paginationDto: PaginationDto) {
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      status: JobStatus.PENDING,
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
          total_payment: true,
          project_duration: true,
          status: true,
          skill: true,
          deadline: true,
          job_photo: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar: true,
              location: true,
              created_at: true,
            },
          },
        },
      }),
    ]);

    const formatData = jobs.map((job) => {
      return {
        id: job.id,
        job_title: job.job_title,
        total_payment: job.total_payment,
        project_duration: job.project_duration,
        deadline: job.deadline,
        status: job.status,
        job_photo: job.job_photo,
        job_photo_url: ImageGetUtil.jobPhoto(job.job_photo),
        skill: job.skill,
        user_name: job.user?.first_name ?? null,
        user_location: job.user?.location ?? null,
        user_photo: job.user?.avatar ?? null,
        user_photo_url: ImageGetUtil.avatar(job.user?.avatar),
        reviews_avarage: 0,
        reviews_count: 0,
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
}
