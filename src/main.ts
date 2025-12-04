import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // --- CONFIGURAÇÃO DO CORS ---
  app.enableCors({
    // Permite apenas a origem definida no .env (ou localhost:5173 como fallback)
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    
    // Métodos permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    
    // Permite enviar Cookies e Headers de Autorização
    credentials: true, 
  });

  // Configuração da pasta de Uploads (Mantive sua lógica)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle("Real Estate API")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Usa a porta do .env ou 3000
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}
bootstrap();