export const validateBody = (schema) => async (req, res, next) => {
  try {
    // Parse and validate the request body against the Zod schema
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors?.map(e => e.message) || error.message
    });
  }
};