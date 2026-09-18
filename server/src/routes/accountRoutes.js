import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAccountSchema } from '../schemas/account.schemas.js';

const router = express.Router();

router.get('/', authenticate, accountController.getAccounts);
router.post('/', authenticate, validate(createAccountSchema), accountController.createAccount);

export default router;
