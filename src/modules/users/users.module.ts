// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfileAI } from './entities/profile-ai.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProfileAI, Image], 'postgres')],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}