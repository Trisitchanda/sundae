import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { updateIncomeSchema, updateSavingsGoalSchema } from '../schemas/settings.schemas.js';

const router = express.Router();

router.use(authenticate);

router.put('/income', csrfProtection, validate(updateIncomeSchema), settingsController.updateIncome);
router.put('/savings-goal', csrfProtection, validate(updateSavingsGoalSchema), settingsController.updateSavingsGoal);

export default router;
