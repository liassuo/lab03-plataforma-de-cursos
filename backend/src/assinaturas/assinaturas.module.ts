import { Module } from '@nestjs/common';
import { AssinaturasService } from './assinaturas.service';
import { AssinaturasController } from './assinaturas.controller';

@Module({
  controllers: [AssinaturasController],
  providers: [AssinaturasService],
})
export class AssinaturasModule {}
