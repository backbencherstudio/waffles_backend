import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus, Prisma } from 'prisma/generated';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHireDto } from './dto/create-hire.dto';

@Injectable()
export class HireService {
  constructor(private prisma: PrismaService) {}

  async createHire(
    userId: string,
    dto: CreateHireDto,
    files: Express.Multer.File[],
    projectPhoto?: Express.Multer.File,
    hireProfileId?: string,
  ) {
    const attachmentPath = appConfig().storageUrl.attachment;
    const photoPath = appConfig().storageUrl.jobPhoto;

    let projectPhotoName: string | null = null;
    if (projectPhoto) {
      const photoExt = projectPhoto.originalname.split('.').pop();
      projectPhotoName = `hire-photo-${Date.now()}.${photoExt}`;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Photo Upload
      if (projectPhoto && projectPhotoName) {
        await SojebStorage.put(
          photoPath + projectPhotoName,
          projectPhoto.buffer,
        );
      }

      // 2. Multi-Attachments Upload
      const createdAttachments = [];
      for (const file of files) {
        const ext = file.originalname.split('.').pop();
        const fileName = `hire-att-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

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

      // 3. Create Hire Record
      const hire = await tx.hire.create({
        data: {
          ...dto,
          user: { connect: { id: userId } },
          project_photo: projectPhotoName,
          hire_profile_id: hireProfileId,
          attachments: {
            connect: createdAttachments.map((a) => ({ id: a.id })),
          },
        },
        include: { attachments: true, user: true },
      });

      return {
        success: true,
        message: 'Hire request created successfully',
        data: this.mapUrls(hire, photoPath, attachmentPath),
      };
    });
  }

  async getAllHiresClient(params: {
    page: number;
    limit: number;
    q: string;
    status?: string;
    userId: string;
  }) {
    const { page, limit, q, status, userId } = params;
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.HireWhereInput = {
        user_id: userId,
      };

      if (q) {
        where.OR = [
          { project_title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (status && Object.values(JobStatus).includes(status as JobStatus)) {
        where.status = status as JobStatus;
      }

      const [hires, total] = await Promise.all([
        this.prisma.hire.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.hire.count({ where }),
      ]);

      const photoPath = appConfig().storageUrl.jobPhoto;

      return {
        success: true,
        message: 'Client hire records fetched successfully',
        data: hires.map((hire) => ({
          id: hire.id,
          project_title: hire.project_title,
          video_duration: hire.video_duration,
          project_budget: hire.project_budget,
          project_duration: hire.project_duration,
          user_id: hire.user_id,
          project_photo_url: hire.project_photo
            ? SojebStorage.url(photoPath + hire.project_photo)
            : null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching client hires:', error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getAllHiresEditor(params: {
    page: number;
    limit: number;
    q: string;
    status?: string;
    userId: string;
  }) {
    const { page, limit, q, status, userId } = params;
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.HireWhereInput = {
        hire_profile_id: userId, // Editor-er profile ID filter kora hoyeche
      };

      if (q) {
        where.OR = [
          { project_title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (status && Object.values(JobStatus).includes(status as JobStatus)) {
        where.status = status as JobStatus;
      }

      const [hires, total] = await Promise.all([
        this.prisma.hire.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.hire.count({ where }),
      ]);

      const photoPath = appConfig().storageUrl.jobPhoto;

      return {
        success: true,
        message: 'Editor hire records fetched successfully',
        data: hires.map((hire) => ({
          id: hire.id,
          project_title: hire.project_title,
          video_duration: hire.video_duration,
          project_budget: hire.project_budget,
          project_duration: hire.project_duration,
          user_id: hire.user_id,
          project_photo_url: hire.project_photo
            ? SojebStorage.url(photoPath + hire.project_photo)
            : null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching editor hires:', error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getHireById(id: string) {
    const hire = await this.prisma.hire.findUnique({
      where: { id },
      include: { attachments: true, user: true },
    });
    if (!hire) throw new NotFoundException('Hire record not found');
    const mappedHire = this.mapUrls(
      hire,
      appConfig().storageUrl.jobPhoto,
      appConfig().storageUrl.attachment,
    );
    return {
      success: true,
      message: 'Hire record fetched successfully',
      data: mappedHire,
    };
  }

  private mapUrls(hire: any, photoPath: string, attPath: string) {
    const mappedHire = {
      ...hire,
      project_photo_url: hire.projectPhoto
        ? SojebStorage.url(photoPath + hire.projectPhoto)
        : null,
      attachments: hire.attachments?.map((att) => ({
        ...att,
        file_url: att.file ? SojebStorage.url(attPath + att.file) : null,
      })),
    };
    return mappedHire;
  }
}
