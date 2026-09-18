export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data', 
        errors: error.errors 
      });
    }
    next(error);
  }
};
