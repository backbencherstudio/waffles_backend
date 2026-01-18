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


  // *update basic info
  @Patch('basic-info')
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
    const userId = req.user.userId;
    return await this.profileService.createPortfolio(
      userId,
      createPortfolioDto,
      thumbnail,
    );
  }

  @ApiOperation({ summary: 'Update portfolio' })
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
    }),
  )
  @Patch('portfolio/:id')
  async updatePortfolio(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updatePortfolio(
      userId,
      id,
      updatePortfolioDto,
      thumbnail,
    );
  }

  @ApiOperation({ summary: 'Delete portfolio' })
  @Delete('portfolio/:id')
  async deletePortfolio(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return await this.profileService.deletePortfolio(userId, id);
  }

  // ==================== EDUCATION ROUTES ====================

  @ApiOperation({ summary: 'Add education' })
  @Post('education')
  async createEducation(
    @Req() req: any,
    @Body() createEducationDto: CreateEducationDto,
  ) {
    const userId = req.user.userId;
    return await this.profileService.createEducation(
      userId,
      createEducationDto,
    );
  }

  @ApiOperation({ summary: 'Update education' })
  @Patch('education/:id')
  async updateEducation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updateEducation(
      userId,
      id,
      updateEducationDto,
    );
  }

  @ApiOperation({ summary: 'Delete education' })
  @Delete('education/:id')
  async deleteEducation(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return await this.profileService.deleteEducation(userId, id);
  }

  // ==================== SKILLS ROUTES ====================

  @ApiOperation({ summary: 'Add skills' })
  @Post('skills')
  async addSkills(@Req() req: any, @Body() createSkillDto: CreateSkillDto) {
    const userId = req.user.userId;
    return await this.profileService.addSkills(userId, createSkillDto);
  }

  @ApiOperation({ summary: 'Remove a skill' })
  @Delete('skills/:skillName')
  async removeSkill(@Req() req: any, @Param('skillName') skillName: string) {
    const userId = req.user.userId;
    return await this.profileService.removeSkill(userId, skillName);
  }
}
