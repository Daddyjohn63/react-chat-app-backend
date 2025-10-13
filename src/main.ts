import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({
    origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,apollographql-client-name,apollographql-client-version,x-apollo-operation-name,x-apollo-cache-control',
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
