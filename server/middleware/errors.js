export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.' });
  res.status(err.statusCode || 500).json({ message: err.message || 'An unexpected server error occurred.' });
}
