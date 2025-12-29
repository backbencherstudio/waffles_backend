import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { StringHelper } from 'src/common/helper/string.helper';
import appConfig from 'src/config/app.config';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

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
            appConfig().storageUrl.avatar + "/" + oldUser.avatar,
          );
        }

        // Upload new avatar
        const fileName = `${StringHelper.randomString()}${avatar.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.avatar + "/" + fileName,
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
