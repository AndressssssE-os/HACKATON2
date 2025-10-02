import express from 'express';
import LineasController from '../controllers/lineasController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', LineasController.obtenerLineas);
router.get('/estadisticas', LineasController.obtenerEstadisticas);
router.get('/buscar', LineasController.buscarLineas);
router.get('/:id', LineasController.obtenerLineaPorId);
router.post('/', auth, LineasController.crearLinea);
router.put('/:id', auth, LineasController.actualizarLinea);
router.delete('/:id', auth, LineasController.eliminarLinea);

export default router;