import express from 'express';
import AuthController from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/registro', AuthController.registrarUsuario);
router.post('/login', AuthController.loginUsuario);
router.get('/perfil', auth, AuthController.obtenerPerfil);
router.put('/cambiar-password', auth, AuthController.cambiarPassword);

export default router;