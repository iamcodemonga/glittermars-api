import { Router } from 'express';
import { profile } from '../controllers/user';

const router = Router();

router.get('/:userid', profile);

export default router