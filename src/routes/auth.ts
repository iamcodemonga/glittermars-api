import { Router } from 'express';
import { register, login, logout } from '../controllers/auth'

const router = Router();

router.post('/register', register);
router.post('/login', login)
router.get('/logout', logout)

export default router