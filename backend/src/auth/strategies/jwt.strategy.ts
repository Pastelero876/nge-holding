import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      JwtStrategy.logger.error('FATAL ERROR: JWT_SECRET no está definida en las variables de entorno.');
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    
    const instanceLogger = new Logger(JwtStrategy.name);
    instanceLogger.log('JwtStrategy inicializada correctamente.');
  }

  /**
   * Valida el payload del token JWT.
   * Este método es llamado por passport-jwt después de verificar la firma y expiración.
   * Lo que retorna aquí se adjunta a `request.user`.
   * @param payload El payload decodificado del JWT.
   */
  async validate(payload: any) {
    const instanceLogger = new Logger(JwtStrategy.name);
    instanceLogger.debug(`Validando payload JWT para usuario ID: ${payload.sub}`);
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      instanceLogger.warn(`Validación JWT fallida: Usuario ${payload.sub} no encontrado o inactivo.`);
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    const userInfo = {
        userId: payload.sub,
        email: payload.email,
        companyId: payload.companyId,
        role: payload.role,
    };
    instanceLogger.debug(`Payload JWT validado. Adjuntando a req.user: ${JSON.stringify(userInfo)}`);
    return userInfo;
  }
}
