import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async createBid(
    userId: string,
    dto: CreateBidDto,
    files: Express.Multer.File[],
    jobId: string, // Made this mandatory as per your route
  ) {
    // Logic Note: Ensure your 'File' model in Prisma
    // actually exists and files are already uploaded/saved
    // if you are using 'connect'.

    const bid = await this.prisma.bid.create({
      data: {
        ...dto,
        // Connect the Job from the URL param
        job: { connect: { id: jobId } },
        // Connect the User
        user: { connect: { id: userId } },
        // If your attachments are a separate table:
        // attachments: {
        //   connect: files.map((file: any) => ({ id: file.id })),
        // },
      },
      include: {
        user: true,
        job: true,
      },
    });

    return {
      success: true,
      message: 'Bid created successfully',
      data: bid,
    };
  }

  findAll() {
    return `This action returns all bids`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
