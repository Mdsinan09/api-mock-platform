const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors?.map((e) => e.message) || ['Validation failed'];
    return res.status(400).json({ error: 'Validation Error', details: messages });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({ error: 'Database error occurred' });
  }

  if (err.message?.includes('OpenAI')) {
    return res.status(502).json({ error: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
