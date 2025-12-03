import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';



@Module({
  imports: [
    PropertiesModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // Aponta para a pasta uploads na raiz do projeto
      serveRoot: '/uploads', // Define que a URL será http://.../uploads/arquivo.jpg
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
