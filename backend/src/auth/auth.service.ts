import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; // Ajustar ruta si es necesario
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client'; // Importar tipo User de Prisma
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Logger para depuración

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida si un usuario existe y la contraseña es correcta.
   * @param email Email del usuario
   * @param pass Contraseña proporcionada (sin hashear)
   * @returns El objeto User si es válido, null en caso contrario.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    console.log(`[AUTH_VALIDATE] Attempting to validate user: ${email}`); // LOG 1

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
        console.log(`[AUTH_VALIDATE] User not found: ${email}`); // LOG 2
        // Considera lanzar new UnauthorizedException('Credenciales inválidas'); aquí
        return null;
    }

    console.log(`[AUTH_VALIDATE] User found: ${user.email}. Comparing password...`); // LOG 3
    // Asegúrate que el campo se llame 'password' en tu BD/modelo
    console.log(`[AUTH_VALIDATE] Hash from DB: ${user.password}`); // LOG 3.1 (Verifica el hash)
    console.log(`[AUTH_VALIDATE] Password from request: ${pass}`); // LOG 3.2 (Verifica la pass recibida)

    // Comprobar si el usuario está activo ANTES de comparar la contraseña
    if (!user.isActive) { 
      console.log(`[AUTH_VALIDATE] User ${email} is inactive.`); // LOG 4.1 (si existe campo isActive)
      // Considera lanzar new UnauthorizedException('Usuario inactivo'); aquí
      return null;
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    console.log(`[AUTH_VALIDATE] Password match result for ${email}: ${isPasswordMatching}`); // LOG 4

    if (isPasswordMatching) { // Solo necesitamos verificar si la contraseña coincide aquí
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Excluye la contraseña
      console.log(`[AUTH_VALIDATE] User ${email} validated successfully.`); // LOG 5
      return result; // Devuelve el usuario sin la contraseña si la contraseña coincide
    } else {
      console.log(`[AUTH_VALIDATE] Password mismatch for user: ${email}`); // LOG 6
      // Considera lanzar new UnauthorizedException('Credenciales inválidas'); aquí
      return null; // Devuelve null si la contraseña no coincide
    }
  }

  /**
   * Genera el token JWT para un usuario validado.
   * @param user Objeto usuario (sin la contraseña)
   * @returns Objeto con el access_token
   */
  async login(user: Omit<User, 'password'>) {
    const payload = {
        email: user.email,
        sub: user.id, // 'sub' (subject) es el estándar para el ID de usuario en JWT
        companyId: user.companyId, // !! CRUCIAL PARA MULTI-TENANT !!
        role: user.role, // Incluir rol para posible RBAC
        // Puedes añadir más datos si son necesarios y no sensibles
    };
    this.logger.log(`Generando token para usuario ${user.email} (ID: ${user.id}, Company: ${user.companyId})`);
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: { // Devolver también información básica del usuario es útil para el frontend
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         role: user.role,
         companyId: user.companyId
      }
    };
  }

  // (Opcional) Método para validar usuario por ID (usado por JwtStrategy)
  async validateUserById(userId: string): Promise<User | null> {
     this.logger.debug(`Validando usuario por ID: ${userId}`);
     const user = await this.prisma.user.findUnique({
        where: { id: userId },
     });
     if (user && user.isActive) {
        return user;
     }
     this.logger.warn(`Validación por ID fallida: Usuario ${userId} no encontrado o inactivo.`);
     return null;
  }
}
