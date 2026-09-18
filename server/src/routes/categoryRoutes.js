import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post('/', csrfProtection, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', csrfProtection, validate(updateCategorySchema), categoryController.updateCategory);

export default router;
