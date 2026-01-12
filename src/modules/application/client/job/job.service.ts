import { BadRequestException, Injectable } from '@nestjs/common';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(
    userId: string,
    dto: CreateJobDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Attachment file is required');
    }

    // 🔹 Generate unique filename (IMPORTANT)
    const fileExt = file.originalname.split('.').pop();
    const fileName = `job-${Date.now()}.${fileExt}`;

    // 🔹 Storage path
    const storagePath = appConfig().storageUrl.attachment.endsWith('/')
      ? appConfig().storageUrl.attachment
      : `${appConfig().storageUrl.attachment}/`;

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Upload file to storage FIRST
      await SojebStorage.put(storagePath + fileName, file.buffer);

      // 2️⃣ Create Attachment record
      const attachment = await tx.attachment.create({
        data: {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          file: fileName,
        },
      });

      // 3️⃣ Create Job + connect attachment
      const job = await tx.jOB.create({
        data: {
          ...dto,
          user_id: userId,
          attachment: {
            connect: [{ id: attachment.id }],
          },
        },
        include: {
          attachment: true,
        },
      });

      // 4️⃣ Generate public URL
      job.attachment = job.attachment.map((att) => ({
        ...att,
        file_url: SojebStorage.url(storagePath + att.file),
      }));

      return {
        success: true,
        message: 'Job created successfully',
        data: job,
      };
    });
  }

  findAllCards() {
    return this.prisma.jOB.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        job_title: true,
        job_category: true,
        platform: true,
        content_length: true,
        project_budget: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  update(id: string, dto: UpdateJobDto) {
    const { attachments, ...jobData } = dto;

    return this.prisma.jOB.update({
      where: { id },
      data: {
        ...jobData,
        attachment: attachments
          ? {
              set: attachments.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  //get all job
  async getAllJobs() {
    try {
      const jobs = await this.prisma.jOB.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          attachment: {
            where: {
              deleted_at: null,
            },
            select: {
              id: true,
              name: true,
              type: true,
              size: true,
              file: true,
              file_alt: true,
              created_at: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return {
        success: true,
        message: 'All Jobs fetched successfully',
        data: jobs,
      };
    } catch (error) {
      console.error('GET ALL JOBS ERROR:', error);
      return {
        success: false,
        message: 'Failed to fetch jobs',
        error: error,
      };
    }
  }

  // changeStatus(id: string, status: JobStatus) {
  //   return this.prisma.jOB.update({
  //     where: { id },
  //     data: { status },
  //   });
  // }

  softDelete(id: string) {
    return this.prisma.jOB.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
