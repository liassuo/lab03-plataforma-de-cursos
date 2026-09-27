import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Ativa a validação dos DTOs (class-validator)
  // transform: true converte os tipos automaticamente (ex: "1" -> 1)
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Plataforma de Cursos API')
    .setDescription('API da Plataforma de Cursos Online (LAB03) - NestJS + Prisma + JWT')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
  console.log('Backend rodando em http://localhost:3000');
  console.log('Documentação Swagger em http://localhost:3000/docs');
}
bootstrap();
