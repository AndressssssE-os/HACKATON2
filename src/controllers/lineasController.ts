import { Request, Response, NextFunction } from 'express';
import LineaProfundizacion from '../models/LineaProfundizacion';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class LineasController {
  /**
   * Obtener todas las líneas de profundización con filtros
   */
  public async obtenerLineas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { area, estado, pagina = 1, limite = 10, ordenar = 'nombre' } = req.query;
      
      // Construir filtros
      let filtro: any = {};
      
      if (area) {
        filtro.areaConocimiento = Array.isArray(area) ? { $in: area } : area;
      }
      
      if (estado) {
        filtro.estado = estado;
      }

      // Configurar paginación
      const paginaNum = Math.max(1, parseInt(pagina as string));
      const limiteNum = Math.min(50, Math.max(1, parseInt(limite as string))); // Máximo 50 por página
      const skip = (paginaNum - 1) * limiteNum;

      // Configurar ordenamiento
      const sort: any = {};
      if (ordenar === 'nombre') sort.nombre = 1;
      else if (ordenar === 'fecha') sort.fechaCreacion = -1;
      else if (ordenar === 'creditos') sort.creditosRequeridos = 1;

      // Ejecutar consulta con concurrencia controlada
      const [lineas, total] = await Promise.all([
        LineaProfundizacion.find(filtro)
          .sort(sort)
          .skip(skip)
          .limit(limiteNum)
          .lean(), // lean() para mejor performance
        
        LineaProfundizacion.countDocuments(filtro)
      ]);

      // Calcular metadatos de paginación
      const totalPaginas = Math.ceil(total / limiteNum);
      const tieneSiguiente = paginaNum < totalPaginas;
      const tieneAnterior = paginaNum > 1;

      logger.debug('Líneas obtenidas', 
        { 
          total, 
          pagina: paginaNum, 
          limite: limiteNum,
          filtros: { area, estado }
        }, 
        (req as any).user?.userId, 
        req.ip
      );

      res.json({
        success: true,
        data: lineas,
        paginacion: {
          total,
          pagina: paginaNum,
          limite: limiteNum,
          totalPaginas,
          tieneSiguiente,
          tieneAnterior
        },
        count: lineas.length
      });

    } catch (error) {
      logger.error('Error obteniendo líneas de profundización', 
        { error: error.message, query: req.query }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Obtener línea por ID
   */
  public async obtenerLineaPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID de línea es requerido', 400);
      }

      const linea = await LineaProfundizacion.findById(id);
      
      if (!linea) {
        throw new AppError('Línea de profundización no encontrada', 404);
      }

      logger.debug('Línea obtenida por ID', { lineaId: id }, (req as any).user?.userId, req.ip);

      res.json({
        success: true,
        data: linea
      });

    } catch (error) {
      logger.error('Error obteniendo línea por ID', 
        { error: error.message, lineaId: req.params.id }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Crear nueva línea de profundización
   */
  public async crearLinea(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        nombre, 
        descripcion, 
        coordinador, 
        emailCoordinador, 
        areaConocimiento, 
        creditosRequeridos, 
        materias 
      } = req.body;

      // Validaciones
      if (!nombre || !descripcion || !coordinador || !emailCoordinador || !areaConocimiento || !creditosRequeridos) {
        throw new AppError('Todos los campos obligatorios deben ser proporcionados', 400);
      }

      if (creditosRequeridos < 0) {
        throw new AppError('Los créditos requeridos deben ser un número positivo', 400);
      }

      if (!this.validarEmailCoordinador(emailCoordinador)) {
        throw new AppError('El email del coordinador no es válido', 400);
      }

      // Verificar si ya existe una línea con el mismo nombre (manejo de concurrencia)
      const lineaExistente = await LineaProfundizacion.findOne({ 
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } 
      });
      
      if (lineaExistente) {
        throw new AppError('Ya existe una línea de profundización con ese nombre', 400);
      }

      // Crear nueva línea
      const linea = new LineaProfundizacion({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        coordinador: coordinador.trim(),
        emailCoordinador: emailCoordinador.toLowerCase().trim(),
        areaConocimiento,
        creditosRequeridos: parseInt(creditosRequeridos),
        materias: Array.isArray(materias) ? materias.map((m: string) => m.trim()) : [],
        estado: 'activa',
        fechaCreacion: new Date()
      });

      await linea.save();

      logger.info('Línea de profundización creada', 
        { 
          lineaId: linea._id, 
          nombre: linea.nombre,
          area: linea.areaConocimiento 
        }, 
        (req as any).user?.userId, 
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'Línea de profundización creada exitosamente',
        data: linea
      });

    } catch (error) {
      logger.error('Error creando línea de profundización', 
        { error: error.message, body: req.body }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Actualizar línea existente
   */
  public async actualizarLinea(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;

      if (!id) {
        throw new AppError('ID de línea es requerido', 400);
      }

      // Validar email si se está actualizando
      if (datosActualizados.emailCoordinador && !this.validarEmailCoordinador(datosActualizados.emailCoordinador)) {
        throw new AppError('El email del coordinador no es válido', 400);
      }

      // Verificar si la línea existe
      const lineaExistente = await LineaProfundizacion.findById(id);
      if (!lineaExistente) {
        throw new AppError('Línea de profundización no encontrada', 404);
      }

      // Verificar duplicados de nombre (excluyendo la línea actual)
      if (datosActualizados.nombre && datosActualizados.nombre !== lineaExistente.nombre) {
        const nombreExistente = await LineaProfundizacion.findOne({
          nombre: { $regex: new RegExp(`^${datosActualizados.nombre}$`, 'i') },
          _id: { $ne: id }
        });
        
        if (nombreExistente) {
          throw new AppError('Ya existe otra línea de profundización con ese nombre', 400);
        }
      }

      // Actualizar línea
      const linea = await LineaProfundizacion.findByIdAndUpdate(
        id,
        { 
          ...datosActualizados,
          $inc: { __v: 1 } // Incrementar versión para control de concurrencia
        },
        { 
          new: true, 
          runValidators: true,
          context: 'query'
        }
      );

      if (!linea) {
        throw new AppError('Línea de profundización no encontrada después de la actualización', 404);
      }

      logger.info('Línea de profundización actualizada', 
        { 
          lineaId: id, 
          cambios: Object.keys(datosActualizados),
          usuario: (req as any).user?.userId 
        }, 
        (req as any).user?.userId, 
        req.ip
      );

      res.json({
        success: true,
        message: 'Línea actualizada exitosamente',
        data: linea
      });

    } catch (error) {
      logger.error('Error actualizando línea de profundización', 
        { error: error.message, lineaId: req.params.id, body: req.body }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Eliminar línea de profundización
   */
  public async eliminarLinea(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID de línea es requerido', 400);
      }

      // Verificar si la línea existe
      const linea = await LineaProfundizacion.findById(id);
      if (!linea) {
        throw new AppError('Línea de profundización no encontrada', 404);
      }

      // En lugar de eliminar físicamente, podríamos marcar como inactiva
      // await LineaProfundizacion.findByIdAndDelete(id);
      
      // Alternativa: marcar como inactiva (soft delete)
      await LineaProfundizacion.findByIdAndUpdate(id, { estado: 'inactiva' });

      logger.warn('Línea de profundización eliminada (marcada como inactiva)', 
        { 
          lineaId: id, 
          nombre: linea.nombre,
          usuario: (req as any).user?.userId 
        }, 
        (req as any).user?.userId, 
        req.ip
      );

      res.json({
        success: true,
        message: 'Línea eliminada exitosamente'
      });

    } catch (error) {
      logger.error('Error eliminando línea de profundización', 
        { error: error.message, lineaId: req.params.id }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Obtener estadísticas de líneas
   */
  public async obtenerEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Ejecutar múltiples consultas en paralelo para mejor performance
      const [
        totalLineas,
        lineasPorArea,
        lineasActivas,
        lineasInactivas,
        creditosPromedio
      ] = await Promise.all([
        // Total de líneas
        LineaProfundizacion.countDocuments(),
        
        // Líneas por área de conocimiento
        LineaProfundizacion.aggregate([
          { $group: { _id: '$areaConocimiento', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Líneas activas
        LineaProfundizacion.countDocuments({ estado: 'activa' }),
        
        // Líneas inactivas
        LineaProfundizacion.countDocuments({ estado: 'inactiva' }),
        
        // Créditos promedio
        LineaProfundizacion.aggregate([
          { $group: { _id: null, promedio: { $avg: '$creditosRequeridos' } } }
        ])
      ]);

      const estadisticas = {
        totalLineas,
        lineasActivas,
        lineasInactivas,
        lineasPorArea: lineasPorArea.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        creditosPromedio: creditosPromedio[0]?.promedio || 0
      };

      logger.debug('Estadísticas de líneas obtenidas', {}, (req as any).user?.userId, req.ip);

      res.json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas de líneas', 
        { error: error.message }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Buscar líneas por texto
   */
  public async buscarLineas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limite = 10 } = req.query;

      if (!q || (q as string).trim().length < 2) {
        throw new AppError('Término de búsqueda debe tener al menos 2 caracteres', 400);
      }

      const lineas = await LineaProfundizacion.find({
        $and: [
          { estado: 'activa' },
          {
            $or: [
              { nombre: { $regex: q, $options: 'i' } },
              { descripcion: { $regex: q, $options: 'i' } },
              { coordinador: { $regex: q, $options: 'i' } },
              { areaConocimiento: { $regex: q, $options: 'i' } },
              { materias: { $in: [new RegExp(q as string, 'i')] } }
            ]
          }
        ]
      }).limit(parseInt(limite as string));

      logger.debug('Búsqueda de líneas realizada', 
        { termino: q, resultados: lineas.length }, 
        (req as any).user?.userId, 
        req.ip
      );

      res.json({
        success: true,
        data: lineas,
        count: lineas.length
      });

    } catch (error) {
      logger.error('Error buscando líneas', 
        { error: error.message, query: req.query }, 
        (req as any).user?.userId, 
        req.ip
      );
      next(error);
    }
  }

  /**
   * Validar email del coordinador
   */
  private validarEmailCoordinador(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default new LineasController();