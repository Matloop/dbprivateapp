import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ScraperService } from './scraper/scraper.service';

@Module({
  imports: [PrismaModule],
  controllers: [PropertiesController],
  providers: [PropertiesService,ScraperService],
})
export class PropertiesModule {}
