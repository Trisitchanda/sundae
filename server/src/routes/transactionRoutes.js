import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTransactionSchema, getTransactionsSchema } from '../schemas/transaction.schemas.js';

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.get('/', authenticate, validate(getTransactionsSchema), cacheMiddleware('transactions', 300), transactionController.getTransactions);
router.post('/', authenticate, validate(createTransactionSchema), transactionController.createTransaction);
router.delete('/:id', authenticate, transactionController.deleteTransaction);

export default router;
