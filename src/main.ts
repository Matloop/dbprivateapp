import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // --- CORREÇÃO AQUI: USAR process.cwd() ---
  // Isso garante que ele pegue a pasta /uploads na raiz do projeto
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle("Real Estate API")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Força IPv4
  await app.listen(3000, '0.0.0.0');
  console.log(`Server running on http://127.0.0.1:3000`);
  console.log(`Uploads directory should be at: ${join(process.cwd(), 'uploads')}`);
}
bootstrap();