import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace el módulo disponible globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta el servicio para que otros módulos puedan inyectarlo
})
export class PrismaModule {} 