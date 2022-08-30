import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// eslint-disable-next-line import/order
import dotenv = require('dotenv');
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dotenv.config().parsed; // ensure process.env have .env vars

const bootstrap = async () => {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const configSwagger = new DocumentBuilder()
    .setTitle('kit-studio-test')
    .setDescription('Open API documentation')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);

  const port = process.env.SERVER_PORT;
  await app.listen(port);
  logger.verbose(`Application is listening on the port ${port}`);
};

bootstrap();
