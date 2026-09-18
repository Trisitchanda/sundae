export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      const parsed = schema.query.parse(req.query);
      for (const key of Object.keys(req.query)) delete req.query[key];
      Object.assign(req.query, parsed);
    }
    if (schema.params) {
      const parsed = schema.params.parse(req.params);
      for (const key of Object.keys(req.params)) delete req.params[key];
      Object.assign(req.params, parsed);
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
