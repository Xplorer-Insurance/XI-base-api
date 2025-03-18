import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { initSwagger } from './app.swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  // Prefijo global de la aplicación
  app.setGlobalPrefix('v1/api');

  //inicializador del Swagger
  initSwagger(app);
  app.enableCors();

  // Pipe de validación de los datos de entrada usando Class-Validation y class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT, "0.0.0.0");
}
bootstrap();
