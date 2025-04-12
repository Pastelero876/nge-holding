// Archivo: backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Conectar a la base de datos al iniciar el módulo
    await this.$connect();
    console.log('Prisma Client Connected');
  }

  // Opcional: Añadir hook para desconectar al cerrar la app
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      console.log('Prisma Client Disconnecting...');
      await app.close(); // Esto debería llamar a $disconnect implicitamente si se configura bien
      await this.$disconnect();
      console.log('Prisma Client Disconnected');
    });
  }
} 