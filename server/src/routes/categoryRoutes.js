const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post('/', csrfProtection, categoryController.createCategory);
router.put('/:id', csrfProtection, categoryController.updateCategory);

module.exports = router;
