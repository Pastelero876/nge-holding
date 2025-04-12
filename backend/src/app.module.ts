import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// Importar AuthModule aquí cuando se cree

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    // AuthModule, // Descomentar luego
    // ... otros módulos de portfolios ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 