import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Controller('bids')
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post(':jobId/create')
  async create(
    @Req() req: any,
    @Param('jobId') jobId: string,
    @Body() dto: CreateBidDto,
  ) {
    const userId = req.user?.userId;

    console.log('BIDS DATA', dto);

    if (!userId) throw new BadRequestException('User ID not found in request');

    const result = await this.bidsService.createBid(userId, dto, jobId);

    return {
      success: true,
      message: 'Bid created successfully',
      data: result,
    };
  }

  @Get('allJobs')
  findAll(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User ID not found in request');
    return this.bidsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidsService.findOne(id);
  }

  @Patch('accept/:bidId')
  accept(@Param('bidId') bidId: string, @Body() dto: UpdateBidDto) {
    return this.bidsService.updateBidStatus(bidId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidsService.remove(+id);
  }
}
