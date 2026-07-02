import { Injectable } from '@nestjs/common';
import appConfig from 'src/config/app.config';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import * as natural from 'natural';
import { JobStatus } from 'src/common/enums/job.enum';
import { calculateSkillMatch } from 'src/common/utils/skill-matcher.util';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  //get all jobs pending job
   async findAll(paginationDto: PaginationDto, editorId: string) {
   
    const page = paginationDto?.page ?? 1;
    const limit = paginationDto?.limit ?? 10;
    const skip = (page - 1) * limit;

    const editor = await this.prisma.user.findUnique({
      where: { id: editorId },
      select: { skills: { select: { skill_name: true } } },
    });

    const editorSkills = (editor?.skills ?? []).map((s) =>
      s.skill_name.toLowerCase().trim()
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
            first_name: true,
            location: true,
            skills: { select: { skill_name: true } },
          },
        },
      },
    });

    const formattedAndMatchedJobs = jobs.map((job) => ({
      id: job.id,
      created_at: job.created_at,
      job_title: job.job_title,
      job_description: job.job_description,
      total_payment: job.total_payment,
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
      match_percentage: calculateSkillMatch(job.skill, editorSkills),
    }));

    formattedAndMatchedJobs.sort((a, b) => b.match_percentage - a.match_percentage);

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
          ? SojebStorage.url(
              appConfig().storageUrl.jobPhoto + '/' + job.job_photo,
            )
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

 
}
