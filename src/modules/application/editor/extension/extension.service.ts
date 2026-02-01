import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExtensionDto } from 'src/modules/application/editor/extension/dto/create-extension.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExtensionService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, jobId: string, dto: CreateExtensionDto) {
    // 1. Job ebong User er status ekshathe check (Performance optimized)
    const job = await this.prisma.jOB.findUnique({
      where: { id: jobId },
      include: {
        // Assuming 'bids' table e assigned editor er information thake
        bids: {
          where: {
            user_id: userId,
            status: 'ACCEPTED', // Sudhu matro jake assign kora hoyeche
          },
        },
        // User type check korar jonno
        user: {
          select: { type: true },
        },
      },
    });

    console.log('job', job);

    // 2. Job existence check
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 3. Status Check: Job must be IN_PROGRESS
    if (job.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Extensions can only be requested for jobs currently in progress',
      );
    }

    // 4. Role & Assignment Validation
    // User check (Assuming req.user logic)
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (requester.type !== 'EDITOR') {
      throw new ForbiddenException(
        'Only Editors are allowed to request time extensions',
      );
    }


    // 5. Create Extension Request
    const result = await this.prisma.extensionRequest.create({
      data: {
        job_id: jobId,
        message: dto.message,
        extension_days: dto.extension_days,
        original_date: job.deadline,
        user_id: userId,
      },
    });

    return {
      success: true,
      message: 'Extension request created successfully',
      data: result,
    };
  }

  async processRequest(
    clientId: string,
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.extensionRequest.findUnique({
        where: { id: requestId },
        include: { job: true },
      });

      if (request.job.user_id !== clientId)
        throw new ForbiddenException('Not your job');

      if (status === 'APPROVED') {
        const newDeadline = new Date(request.original_date);
        newDeadline.setDate(newDeadline.getDate() + request.extension_days);

        await tx.jOB.update({
          where: { id: request.job_id },
          data: { deadline: newDeadline },
        });
      }

      return tx.extensionRequest.update({
        where: { id: requestId },
        data: { status },
      });
    });
  }
}
