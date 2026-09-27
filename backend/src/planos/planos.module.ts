import { Module } from '@nestjs/common';
import { PlanosService } from './planos.service';
import { PlanosController } from './planos.controller';

@Module({
  controllers: [PlanosController],
  providers: [PlanosService],
})
export class PlanosModule {}
