import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Registro de nuevo usuario
   */
  public async registrarUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre, email, password, rol } = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password) {
        throw new AppError('Nombre, email y contraseña son requeridos', 400);
      }

      if (password.length < 6) {
        throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
      }

      if (!this.validarEmail(email)) {
        throw new AppError('El formato del email no es válido', 400);
      }

      // Verificar si el usuario ya existe (con manejo de concurrencia)
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        logger.warn('Intento de registro con email existente', { email }, undefined, req.ip);
        throw new AppError('El usuario ya existe', 400);
      }

      // Crear nuevo usuario
      const usuario = new Usuario({
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        password,
        rol: rol || 'estudiante'
      });

      await usuario.save();

      // Generar token JWT
      const token = this.generarToken(usuario._id.toString());

      // Log del evento
      logger.authEvent('REGISTRO_EXITOSO', usuario._id.toString(), email, req.ip);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });

    } catch (error) {
      logger.error('Error en registro de usuario', 
        { error: error.message, body: req.body }, 
        undefined, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Login de usuario
   */
  public async loginUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validaciones
      if (!email || !password) {
        throw new AppError('Email y contraseña son requeridos', 400);
      }

      // Buscar usuario
      const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
      if (!usuario) {
        logger.warn('Intento de login con email no encontrado', { email }, undefined, req.ip);
        throw new AppError('Credenciales inválidas', 401);
      }

      // Verificar contraseña
      const esPasswordValido = await usuario.compararPassword(password);
      if (!esPasswordValido) {
        logger.warn('Intento de login con contraseña incorrecta', { email }, usuario._id.toString(), req.ip);
        throw new AppError('Credenciales inválidas', 401);
      }

      // Verificar si el usuario está activo (podría extenderse para incluir estado)
      if (usuario.rol === 'inactivo') {
        throw new AppError('Cuenta inactiva. Contacte al administrador.', 403);
      }

      // Generar token
      const token = this.generarToken(usuario._id.toString());

      // Actualizar último login
      await Usuario.findByIdAndUpdate(usuario._id, { 
        $set: { ultimoLogin: new Date() }
      });

      // Log del evento
      logger.authEvent('LOGIN_EXITOSO', usuario._id.toString(), email, req.ip);

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });

    } catch (error) {
      logger.error('Error en login de usuario', 
        { error: error.message, email: req.body.email }, 
        undefined, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  public async obtenerPerfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const usuario = await Usuario.findById(userId).select('-password');
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
      }

      logger.debug('Perfil de usuario consultado', {}, userId, req.ip);

      res.json({
        success: true,
        usuario
      });

    } catch (error) {
      logger.error('Error obteniendo perfil de usuario', 
        { error: error.message }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Cambiar contraseña
   */
  public async cambiarPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { passwordActual, nuevaPassword } = req.body;

      if (!passwordActual || !nuevaPassword) {
        throw new AppError('La contraseña actual y la nueva contraseña son requeridas', 400);
      }

      if (nuevaPassword.length < 6) {
        throw new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
      }

      const usuario = await Usuario.findById(userId);
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Verificar contraseña actual
      const esPasswordValido = await usuario.compararPassword(passwordActual);
      if (!esPasswordValido) {
        logger.warn('Intento de cambio de contraseña con credenciales incorrectas', {}, userId, req.ip);
        throw new AppError('La contraseña actual es incorrecta', 400);
      }

      // Actualizar contraseña
      usuario.password = nuevaPassword;
      await usuario.save();

      logger.authEvent('PASSWORD_CAMBIADA', userId, usuario.email, req.ip);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      logger.error('Error cambiando contraseña', 
        { error: error.message }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Validar formato de email
   */
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generar token JWT
   */
  private generarToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'secret_key',
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'lineas-profundizacion-api',
        subject: userId
      }
    );
  }

  /**
   * Verificar token (útil para validar tokens en otros servicios)
   */
  public async verificarToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }
}

export default new AuthController();