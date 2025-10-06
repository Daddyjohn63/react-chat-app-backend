import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,apollographql-client-name,apollographql-client-version,x-apollo-operation-name,x-apollo-cache-control',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
