import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ExtensionService } from './extension.service';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { UpdateExtensionDto } from './dto/update-extension.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('extension')
@UseGuards(JwtAuthGuard)
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Post(':jobId/create')
  create(@Body() createExtensionDto: CreateExtensionDto, @Req() req: any, @Param('jobId') jobId: string) {
    const user_id = req.user?.userId;
    return this.extensionService.createRequest(user_id, jobId, createExtensionDto);
  }

  // @Get()
  // findAll() {
  //   return this.extensionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.extensionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateExtensionDto: UpdateExtensionDto) {
  //   return this.extensionService.update(+id, updateExtensionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.extensionService.remove(+id);
  // }
}
