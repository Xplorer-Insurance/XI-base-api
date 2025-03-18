import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { CustomConfigModule } from './config/config.module';
import { ScraperController } from './modules/scraper/scraper.controller';
import { ScraperService } from './modules/scraper/scraper.service';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    DatabaseModule,
    UsersModule,
    ScraperModule,
    CustomConfigModule,
    MulterModule.register({ dest: './uploads' })
  ],
  controllers: [AppController, ScraperController],
  providers: [AppService, ScraperService]
})
export class AppModule {}
