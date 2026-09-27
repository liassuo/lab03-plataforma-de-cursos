import { Module } from '@nestjs/common';
import { TrilhasService } from './trilhas.service';
import { TrilhasController } from './trilhas.controller';

@Module({
  controllers: [TrilhasController],
  providers: [TrilhasService],
})
export class TrilhasModule {}
