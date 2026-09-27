import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Ativa a validação dos DTOs (class-validator)
  // transform: true converte os tipos automaticamente (ex: "1" -> 1)
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
  console.log('Backend rodando em http://localhost:3000');
}
bootstrap();
