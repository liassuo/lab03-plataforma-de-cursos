import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

// Endereço do Kafka: localhost quando o backend roda no PC, kafka:29092 dentro do Docker
export const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

// Tópicos usados pelo sistema
export const TOPICOS = ['usuario-criado', 'curso-atualizado'];

// O consumidor dá erro se o tópico não existir, então criamos os que faltam antes de ligar
export async function criarTopicos() {
  const admin = new Kafka({ clientId: 'plataforma-cursos-admin', brokers: [KAFKA_BROKER] }).admin();
  await admin.connect();
  const existentes = await admin.listTopics();
  const faltando = TOPICOS.filter((topico) => !existentes.includes(topico));
  if (faltando.length > 0) {
    await admin.createTopics({ topics: faltando.map((topic) => ({ topic })) });
  }
  await admin.disconnect();
}

// @Global: o produtor do Kafka pode ser injetado em qualquer service sem importar este módulo
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'plataforma-cursos-produtor', brokers: [KAFKA_BROKER] },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MensageriaModule {}
