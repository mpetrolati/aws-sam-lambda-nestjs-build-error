import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { FastifyServerOptions } from 'fastify';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import fastifyHelmet from '@fastify/helmet'


async function bootstrap() {

  let logLevel: LogLevel[] = ['warn', 'error'];
  if (((process.env.LOGGER || '0') === '1') || ((process.env.NODE_ENV || 'development') === 'development')) {
    logLevel = ['log', 'error', 'warn', 'debug', 'verbose'];
  }

  Logger.log(logLevel);
  Logger.log(`process.env.NODE_ENV #${process.env.NODE_ENV}#`);


  const serverOptions: FastifyServerOptions = {
    logger: (process.env.LOGGER || '0') == '1',
    bodyLimit: 10 * 1024 * 1024 // 10MB ApiGateway Limit
  };

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(serverOptions),
    {
      logger: logLevel
    }
  );

  const CORS_OPTIONS = {
    origin: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: false,
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE'],
  };

  app.register(require('@fastify/cors'), CORS_OPTIONS);

  await app.register(fastifyHelmet, {
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
    }
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(process.env.API_PREFIX);

  //@ts-strict
  await app.listen(3000);

  if (process.env.NODE_ENV === 'development') {
    console.log(`NestJS started on port ${process.env.PORT || 3000}`);
  }

}
bootstrap();