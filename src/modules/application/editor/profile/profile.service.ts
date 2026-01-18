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
    thumbnail?: Express.Multer.File,
  ) {
    try {
      let thumbnailName = null;

      if (thumbnail) {
        thumbnailName = `${StringHelper.randomString()}${thumbnail.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.portfolio + '/' + thumbnailName,
          thumbnail.buffer,
        );
      }

      const portfolio = await this.prisma.protfolio.create({
        data: {
          title: createPortfolioDto.title,
          project_type: createPortfolioDto.project_type || [],
          description: createPortfolioDto.description,
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




  async updatePortfolio(
    userId: string,
    portfolioId: string,
    updatePortfolioDto: UpdatePortfolioDto,
    thumbnail?: Express.Multer.File,
  ) {
    try {
      // Check if portfolio exists and belongs to user
      const existingPortfolio = await this.prisma.protfolio.findFirst({
        where: { id: portfolioId, user_id: userId, deleted_at: null },
      });

      if (!existingPortfolio) {
        return {
          success: false,
          message: 'Portfolio not found',
        };
      }

      const data: any = {};

      if (updatePortfolioDto.title) {
        data.title = updatePortfolioDto.title;
      }
      if (updatePortfolioDto.project_type) {
        data.project_type = updatePortfolioDto.project_type;
      }
      if (updatePortfolioDto.description !== undefined) {
        data.description = updatePortfolioDto.description;
      }

      if (thumbnail) {
        // Delete old thumbnail
        if (existingPortfolio.thumbnail) {
          await SojebStorage.delete(
            appConfig().storageUrl.portfolio +
              '/' +
              existingPortfolio.thumbnail,
          );
        }

        const thumbnailName = `${StringHelper.randomString()}${thumbnail.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.portfolio + '/' + thumbnailName,
          thumbnail.buffer,
        );
        data.thumbnail = thumbnailName;
      }

      data.updated_at = new Date();

      const portfolio = await this.prisma.protfolio.update({
        where: { id: portfolioId },
        data: data,
      });

      return {
        success: true,
        message: 'Portfolio updated successfully',
        data: portfolio,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update portfolio',
      };
    }
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    try {
      const portfolio = await this.prisma.protfolio.findFirst({
        where: { id: portfolioId, user_id: userId, deleted_at: null },
      });

      if (!portfolio) {
        return {
          success: false,
          message: 'Portfolio not found',
        };
      }

      await this.prisma.protfolio.update({
        where: { id: portfolioId },
        data: { deleted_at: new Date() },
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

  // ==================== EDUCATION ====================

  async createEducation(
    userId: string,
    createEducationDto: CreateEducationDto,
  ) {
    try {
      const education = await this.prisma.education.create({
        data: {
          course_name: createEducationDto.course_name,
          subject: createEducationDto.subject,
          passing_year: createEducationDto.passing_year,
          user_id: userId,
        },
      });

      return {
        success: true,
        message: 'Education added successfully',
        data: education,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to add education',
      };
    }
  }

  async updateEducation(
    userId: string,
    educationId: string,
    updateEducationDto: UpdateEducationDto,
  ) {
    try {
      const existingEducation = await this.prisma.education.findFirst({
        where: { id: educationId, user_id: userId, deleted_at: null },
      });

      if (!existingEducation) {
        return {
          success: false,
          message: 'Education not found',
        };
      }

      const data: any = { updated_at: new Date() };

      if (updateEducationDto.course_name) {
        data.course_name = updateEducationDto.course_name;
      }
      if (updateEducationDto.subject) {
        data.subject = updateEducationDto.subject;
      }
      if (updateEducationDto.passing_year) {
        data.passing_year = updateEducationDto.passing_year;
      }

      const education = await this.prisma.education.update({
        where: { id: educationId },
        data: data,
      });

      return {
        success: true,
        message: 'Education updated successfully',
        data: education,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update education',
      };
    }
  }

  async deleteEducation(userId: string, educationId: string) {
    try {
      const education = await this.prisma.education.findFirst({
        where: { id: educationId, user_id: userId, deleted_at: null },
      });

      if (!education) {
        return {
          success: false,
          message: 'Education not found',
        };
      }

      await this.prisma.education.update({
        where: { id: educationId },
        data: { deleted_at: new Date() },
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

  // ==================== SKILLS ====================

  async addSkills(userId: string, createSkillDto: CreateSkillDto) {
    try {
      // Check if user already has skills record
      const existingSkills = await this.prisma.skills.findFirst({
        where: { user_id: userId, deleted_at: null },
      });

      if (existingSkills) {
        // Update existing skills by merging arrays
        const mergedSkills = [
          ...new Set([
            ...existingSkills.skill_name,
            ...createSkillDto.skill_name,
          ]),
        ];

        const skills = await this.prisma.skills.update({
          where: { id: existingSkills.id },
          data: {
            skill_name: mergedSkills,
            updated_at: new Date(),
          },
        });

        return {
          success: true,
          message: 'Skills updated successfully',
          data: skills,
        };
      } else {
        // Create new skills record
        const skills = await this.prisma.skills.create({
          data: {
            skill_name: createSkillDto.skill_name,
            user_id: userId,
          },
        });

        return {
          success: true,
          message: 'Skills added successfully',
          data: skills,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to add skills',
      };
    }
  }

  async removeSkill(userId: string, skillName: string) {
    try {
      const existingSkills = await this.prisma.skills.findFirst({
        where: { user_id: userId, deleted_at: null },
      });

      if (!existingSkills) {
        return {
          success: false,
          message: 'Skills not found',
        };
      }

      const updatedSkills = existingSkills.skill_name.filter(
        (skill) => skill.toLowerCase() !== skillName.toLowerCase(),
      );

      const skills = await this.prisma.skills.update({
        where: { id: existingSkills.id },
        data: {
          skill_name: updatedSkills,
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Skill removed successfully',
        data: skills,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to remove skill',
      };
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    avatar?: Express.Multer.File,
  ) {
    try {
      const data: any = {};

      if (updateProfileDto.name) {
        data.name = updateProfileDto.name;
      }
      if (updateProfileDto.bio) {
        data.bio = updateProfileDto.bio;
      }
      if (updateProfileDto.location) {
        data.location = updateProfileDto.location;
      }
      if (updateProfileDto.language) {
        if (typeof updateProfileDto.language === 'string') {
          data.language = updateProfileDto.language
            .split(',')
            .map((lang: string) => lang.trim());
        } else if (Array.isArray(updateProfileDto.language)) {
          data.language = updateProfileDto.language;
        }
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
        data: data,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          location: true,
          language: true,
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }
}
