import { Module } from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { MatriculasController } from './matriculas.controller';

@Module({
  controllers: [MatriculasController],
  providers: [MatriculasService],
})
export class MatriculasModule {}
