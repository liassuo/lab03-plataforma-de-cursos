import 'dotenv/config';
// Desliga um aviso do kafkajs sobre a troca do particionador padrão na versão 2
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import { KAFKA_BROKER, criarTopicos } from './mensageria/mensageria.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Ativa a validação dos DTOs (class-validator)
  // transform: true converte os tipos automaticamente (ex: "1" -> 1)
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Trata os erros do Prisma (ex: violação de chave estrangeira vira 409)
  app.useGlobalFilters(new PrismaExceptionFilter());

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

  // Liga o consumidor do Kafka na mesma aplicação (os @EventPattern dos controllers)
  await criarTopicos();
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'plataforma-cursos-consumidor', brokers: [KAFKA_BROKER] },
      consumer: { groupId: 'plataforma-cursos' },
    },
  });
  await app.startAllMicroservices();

  await app.listen(3000);
  console.log('Backend rodando em http://localhost:3000');
  console.log('Documentação Swagger em http://localhost:3000/docs');
}
bootstrap();
