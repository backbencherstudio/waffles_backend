import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async createBid(userId: string, dto: CreateBidDto, jobId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { type: true },
      });

      if (!user || user.type !== 'EDITOR') {
        throw new BadRequestException(
          'Only users with EDITOR type can place a bid.',
        );
      }

      const existingBid = await this.prisma.bid.findFirst({
        where: {
          user_id: userId,
          jobId: jobId,
          deleted_at: null,
        },
      });

      if (existingBid) {
        throw new BadRequestException(
          'You have already placed a bid on this job.',
        );
      }

      const bid = await this.prisma.bid.create({
        data: {
          amount: dto.amount,
          message: dto.message,
          req_date: dto.req_date ? new Date(dto.req_date) : null,
          job: { connect: { id: jobId } },
          user: { connect: { id: userId } },
        },
        include: {
          job: true,
          user: true,
        },
      });

      return {
        success: true,
        message: 'Bid created successfully',
        data: bid,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      console.error('Prisma Error:', error);
      throw new BadRequestException(
        'Prisma operation failed. Check if jobId or userId is valid.',
      );
    }
  }

  // Editor's bids fetch
  async findAll(userId: string) {
    const bids = await this.prisma.bid.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: {
        job: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const jobData = bids
      .filter((bid) => bid.job !== null)
      .map((bid) => {
        const job = bid.job;
        return {
          id: job.id,
          job_title: job.job_title,
          job_description: job.job_description,
          job_photo: job.job_photo
            ? SojebStorage.url(appConfig().storageUrl.jobPhoto + job.job_photo)
            : null,
          content_length: job.content_length,
          project_budget: job.project_budget,
          job_category: job.job_category,
          project_duration: job.project_duration,
          total_payment: job.total_payment,
          status: job.status,
          created_at: job.created_at,
          updated_at: job.updated_at,
          deleted_at: job.deleted_at,
          user_id: job.user_id,
        };
      });

    return {
      success: true,
      message: 'Jobs retrieved successfully based on your bids',
      data: jobData,
    };
  }

  // একটি নির্দিষ্ট Bid fetch করার জন্য
  async findOne(id: string) {
    // আপনার মডেলে ID হলো String (cuid)
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        user: true,
        job: true,
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Bid details retrieved successfully',
      data: bid,
    };
  }

  async updateBid(id: string, dto: UpdateBidDto) {
    try {
      // প্রথমে চেক করুন Bid টি আছে কিনা
      const existingBid = await this.prisma.bid.findUnique({
        where: { id },
      });

      if (!existingBid) {
        throw new NotFoundException(`Bid with ID ${id} not found`);
      }

      // Bid Update করা
      const updatedBid = await this.prisma.bid.update({
        where: { id },
        data: {
          amount: dto.amount,
          message: dto.message,
          req_date: dto.req_date ? new Date(dto.req_date) : undefined,
        },
        include: {
          job: true,
          user: true,
        },
      });

      return {
        success: true,
        message: 'Bid updated successfully',
        data: updatedBid,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Prisma Error:', error);
      throw new BadRequestException('Failed to update bid');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
