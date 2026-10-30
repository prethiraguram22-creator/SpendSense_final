export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.safeParse(dataToValidate);

      if (!parsed.success) {
        const errors = parsed.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      req[source] = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

