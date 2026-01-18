import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { StringHelper } from 'src/common/helper/string.helper';
import appConfig from 'src/config/app.config';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@Injectable()
export class ProfileService {
  
  constructor(private prisma: PrismaService) {}

   
  // *update basic info
  async updateBasicProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    avatar?: Express.Multer.File,
  ) {
    try {
      const data: any = {};
      if (createProfileDto.name) {
        data.name = createProfileDto.name;
      }
      if (createProfileDto.bio) {
        data.bio = createProfileDto.bio;
      }
      if (createProfileDto.location) {
        data.location = createProfileDto.location;
      }
      if (createProfileDto.language) {
        data.language = createProfileDto.language;
      }

      if (avatar) {
        // Delete old avatar from storage
        const oldUser = await this.prisma.user.findFirst({
          where: { id: userId },
          select: { avatar: true },
        });
        if (oldUser?.avatar) {
          await SojebStorage.delete(
            appConfig().storageUrl.avatar + '/' + oldUser.avatar,
          );
        }

        // Upload new avatar
        const fileName = `${StringHelper.randomString()}${avatar.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.avatar + '/' + fileName,
          avatar.buffer,
        );
        data.avatar = fileName;
      }

      // Update user profile
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: data
      });

      return {
        success: true,
        message: 'Basic profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update basic profile',
      };
    } 
  }

  // *update about me section
  async updateAbout(
    userId: string, 
    updateAboutDto: UpdateAboutDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          about_me: updateAboutDto.about_me,
        },
        select: {
          id: true,
          about_me: true,
        },
      });
      return {
        success: true,
        message: 'About section updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update about section',
      };
    }
  }

  // topic:protfolio

  // *create portfolio
  async createPortfolio(
    userId: string,
    createPortfolioDto: CreatePortfolioDto,
    thumbnail: Express.Multer.File,
  ) {
    try {

      const { title, project_type, description  } = createPortfolioDto

      let thumbnailName = null;

      if (thumbnail) {
        thumbnailName = `${StringHelper.randomString()}${thumbnail.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.portfolio + '/' + thumbnailName,
          thumbnail.buffer,
        );
        thumbnailName = thumbnailName;
      }

      const portfolio =  await this.prisma.protfolio.create({
        data: {
          title: title,
          project_type: project_type ,
          description: description,
          thumbnail: thumbnailName,
          user_id: userId,
        },
      });

      return {
        success: true,
        message: 'Portfolio created successfully',
        data: portfolio,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create portfolio',
      };
    }
  }

  // *update portfolio
  async updatePortfolio(
    userId: string,
    id: string,
    updatePortfolioDto: UpdatePortfolioDto,
    thumbnail?: Express.Multer.File,
  ) {
    try {
      const data: any = {};

      if (updatePortfolioDto.title) {
        data.title = updatePortfolioDto.title;
      }
      if (updatePortfolioDto.project_type) {
        data.project_type = updatePortfolioDto.project_type;
      }
      if (updatePortfolioDto.description) {
        data.description = updatePortfolioDto.description;
      }
      
      if (thumbnail) {
        // Delete old thumbnail from storage
        const oldPortfolio = await this.prisma.protfolio.findFirst({
          where: { id: id, user_id: userId },
          select: { thumbnail: true },
        });
        if (oldPortfolio?.thumbnail) {
          await SojebStorage.delete(
            appConfig().storageUrl.portfolio + '/' + oldPortfolio.thumbnail,
          );
        }
        // Upload new thumbnail
        const thumbnailName = `${StringHelper.randomString()}${thumbnail.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.portfolio + '/' + thumbnailName,
          thumbnail.buffer,
        );
        data.thumbnail = thumbnailName;
      }

      const updatedPortfolio = await this.prisma.protfolio.update({
        where: { id: id, user_id: userId },
        data: data,
      });
      return {
        success: true,
        message: 'Portfolio updated successfully',
        data: updatedPortfolio,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update portfolio',
      };
    }

  }
 
  // *delete portfolio
  async deletePortfolio(userId: string, id: string) {
    try {
      // Delete portfolio thumbnail from storage
      const portfolio = await this.prisma.protfolio.findFirst({
        where: { id: id, user_id: userId },
        select: { thumbnail: true },
      });
      if (portfolio?.thumbnail) {
        await SojebStorage.delete(
          appConfig().storageUrl.portfolio + '/' + portfolio.thumbnail,
        );
      }
      // Delete portfolio from database
      await this.prisma.protfolio.delete({
        where: { id: id, user_id: userId },
      });
      return {
        success: true,
        message: 'Portfolio deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete portfolio',
      };
    }

  }

  // topic:education

  // *create education
  async createEducation(
    userId: string,
    createEducationDto: CreateEducationDto,
  ) {
    try {
      const { course_name, subject, passing_year } = createEducationDto;

      const education =  await this.prisma.education.create({
        data: {
          course_name: course_name,
          subject: subject,
          passing_year: passing_year,
          user_id: userId,
        },
      });
      return {
        success: true,
        message: 'Education created successfully',
        data: education,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create education',
      };
    }

  }


  // *update education
  async updateEducation(
    userId: string,
    id: string,
    updateEducationDto: UpdateEducationDto,
  ) {
    try {
      const data: any = {};
      if (updateEducationDto.course_name) {
        data.course_name = updateEducationDto.course_name;
      }
      if (updateEducationDto.subject) {
        data.subject = updateEducationDto.subject;
      }
      if (updateEducationDto.passing_year) {
        data.passing_year = updateEducationDto.passing_year;
      }
      const updatedEducation = await this.prisma.education.update({
        where: { id: id, user_id: userId },
        data: data,
      });
      return {
        success: true,
        message: 'Education updated successfully',
        data: updatedEducation,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update education',
      };
    }
  }

  //* Delete education
  async deleteEducation(userId: string, id: string) {
    try {
      await this.prisma.education.delete({
        where: { id: id, user_id: userId },
      });
      return {
        success: true,
        message: 'Education deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete education',
      };
    }
  }

  // topic:skill

  // *create skill
  async createSkills(
    userId: string,
    dto: CreateSkillDto,
  ) {
    try {
      const result = await this.prisma.skills.upsert({
        where: { user_id: userId },
        update: { skill_name: dto.skill_name },
        create: {
          skill_name: dto.skill_name,
          user_id: userId,
        },
      });
      return {
        success: true,
        message: 'Skills created successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create skills',
      };
    }
  }

}
