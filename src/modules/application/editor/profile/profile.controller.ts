import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { use } from 'passport';

@ApiTags('Editor Profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('editor/profile')
export class ProfileController {
  
  constructor(private readonly profileService: ProfileService) {}

  // *get full profile
  @Get()
  async getProfile(
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return await this.profileService.getFullProfile(userId);
  }

  // *profile info update 
  @Patch('profile-info')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateBasicInfo(
    @Req() req: any,
    @Body() createProfileDto: CreateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updateBasicProfile(userId, createProfileDto, avatar);
  }

  //  * update  about me section
  @Patch('about-me')
  async updateAboutMe(
    @Req() req: any,
    @Body() updateAboutDto: UpdateAboutDto,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updateAbout(userId, updateAboutDto);
  }

  // topic:protfile 

  // *create portfolio
  @Post('portfolio')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createPortfolio(
    @Req() req: any,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {

    if (!thumbnail) {
      throw new BadRequestException('Thumbnail file is required');
    }

    const userId = req.user.userId;
    return await this.profileService.createPortfolio(
      userId,
      createPortfolioDto,
      thumbnail,
    );
  }

  // *update portfolio
  @Patch('portfolio/:id')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updatePortfolio(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updatePortfolio(
      userId,
      id,
      updatePortfolioDto,
      thumbnail,
    );
  }

  // *delete portfolio
  @Delete('portfolio/:id')
  async deletePortfolio(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    return await this.profileService.deletePortfolio(userId, id);
  }

  // topic:education

  // *create education
  @Post('education')
  async createEducation(
    @Req() req: any,
    @Body() createEducationDto: CreateEducationDto,
  ) {
    const userId = req.user.userId;
    return await this.profileService.createEducation(
      userId, 
      createEducationDto);
  }
  
  // *update education
  @Patch('education/:id')
  async updateEducation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    const userId = req.user.userId;
    // Implement the service method to handle education update
    return await this.profileService.updateEducation(
      userId,
      id,
      updateEducationDto,
    );
  }

  //* Delete education
  @Delete('education/:id')
  async deleteEducation(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    return { message: 'Delete education endpoint', userId, id };
  }


  // topic:skills
  
  // *add skills
  @Post('skills')
  async addSkills(
    @Req() req: any,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    const userId = req.user.userId;
    return await this.profileService.createSkills(userId, createSkillDto);
  }













}
