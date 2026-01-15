import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const cors = require('cors');
  const app = await NestFactory.create(AppModule);
  app.use(cors());

   // Activer la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      transform: true, // Transforme les types automatiquement
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non définies
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
