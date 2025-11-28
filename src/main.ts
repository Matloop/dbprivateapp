import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //swagger config
  const config = new DocumentBuilder()
    .setTitle("Real State Api")
    .build();

  const document = SwaggerModule.createDocument(app,config);

  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);


}
bootstrap();
