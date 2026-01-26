import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
    files: Express.Multer.File[],
    jobPhoto?: Express.Multer.File,
  ) {
    // 1. Initial Validation
    if (!files?.length) {
      throw new BadRequestException('At least one attachment file is required');
    }

    return this.prisma.$transaction(async (tx) => {
      // ⬇️ NEW: User type check logic
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { type: true },
      });

      if (!user || user.type !== 'CLIENT') {
        throw new ForbiddenException('Only clients are allowed to create jobs');
      }
      // ⬆️ End of check

      const attachmentPath = appConfig().storageUrl.attachment.endsWith('/')
        ? appConfig().storageUrl.attachment
        : `${appConfig().storageUrl.attachment}/`;

      const jobPhotoPath = appConfig().storageUrl.jobPhoto.endsWith('/')
        ? appConfig().storageUrl.jobPhoto
        : `${appConfig().storageUrl.jobPhoto}/`;

      // Job photo filename logic
      let jobPhotoName: string | null = null;
      if (jobPhoto) {
        const photoExt = jobPhoto.originalname.split('.').pop();
        jobPhotoName = `job-photo-${Date.now()}.${photoExt}`;

        await SojebStorage.put(jobPhotoPath + jobPhotoName, jobPhoto.buffer);
      }

      // Attachment processing
      const createdAttachments = [];
      for (const file of files) {
        const ext = file.originalname.split('.').pop();
        const fileName = `job-attachment-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

        await SojebStorage.put(attachmentPath + fileName, file.buffer);

        const attachment = await tx.attachment.create({
          data: {
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            file: fileName,
          },
        });
        createdAttachments.push(attachment);
      }

      // Create job
      const job = await tx.jOB.create({
        data: {
          ...dto,
          user_id: userId,
          job_photo: jobPhotoName,
          attachment: {
            connect: createdAttachments.map((a) => ({ id: a.id })),
          },
        },
        include: {
          attachment: true,
        },
      });

      return {
        success: true,
        message: 'Job created successfully',
        data: {
          ...job,
          job_photo_url: job.job_photo
            ? SojebStorage.url(jobPhotoPath + job.job_photo)
            : null,
          attachment: job.attachment.map((att) => ({
            ...att,
            file_url: att.file
              ? SojebStorage.url(attachmentPath + att.file)
              : null,
          })),
        },
      };
    });
  }

  //get all job
  async getAllJobs(params: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    userId?: string;
  }) {
    try {
      const page =
        Number.isFinite(params.page) && params.page > 0 ? params.page : 1;
      const limit =
        Number.isFinite(params.limit) && params.limit > 0 && params.limit <= 50
          ? params.limit
          : 10;

      const skip = (page - 1) * limit;

      const where: any = {
        user_id: params.userId,
        deleted_at: null,
      };

      //  Search (title/description)
      if (params.q?.trim()) {
        const q = params.q.trim();
        where.OR = [
          { job_title: { contains: q, mode: 'insensitive' } },
          { job_description: { contains: q, mode: 'insensitive' } },
        ];
      }

      //  Filter by status (optional)
      if (params.status) {
        where.status = params.status;
      }

      const [total, jobs] = await this.prisma.$transaction([
        this.prisma.jOB.count({ where }),
        this.prisma.jOB.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            job_title: true,
            total_payment: true,
            created_at: true,
            status: true,
            job_photo: true,
          },
        }),
      ]);

      const data = jobs.map((job) => ({
        id: job.id,
        title: job.job_title,
        amount: job.total_payment ?? 0,
        time: job.created_at,
        status: job.status,
        job_photo_url: job.job_photo
          ? SojebStorage.url(appConfig().storageUrl.jobPhoto + job.job_photo)
          : null,
      }));

      return {
        success: true,
        message: 'All Jobs Post fetched successfully',
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: data,
      };
    } catch (error) {
      console.error('GET ALL JOBS ERROR:', error);
      return { success: false, message: 'Failed to fetch jobs', error };
    }
  }

  async getSingleJob(id: string) {
    try {
      const job = (await this.prisma.jOB.findFirst({
        where: { id, deleted_at: null },
        include: {
          bids: {
            where: { deleted_at: null },
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
            orderBy: { created_at: 'desc' },
          },
        },
      })) as any;

      if (!job) return { success: false, message: 'Job not found' };

      const formattedBids = job?.bids?.map((b: any) => ({
        id: b.id,
        amount: b.amount,
        message: b.message,
        created_at: b.created_at,
        user: {
          ...b.user,
          avatar: b.user?.avatar
            ? SojebStorage.url(appConfig().storageUrl.avatar + b.user.avatar)
            : null,
        },
      }));

      return {
        success: true,
        message: 'Job fetched successfully',
        data: {
          ...job,
          job_photo: job.job_photo
            ? SojebStorage.url(appConfig().storageUrl.jobPhoto + job.job_photo)
            : null,
          bids: formattedBids,
        },
      };
    } catch (error) {
      console.error('GET SINGLE JOB ERROR:', error);
      return {
        success: false,
        message: 'Failed to fetch job',
        error: error.message,
      };
    }
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

  softDelete(id: string) {
    return this.prisma.jOB.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
