const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const db = require('./db/database');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const requestLog = [];
const analyticsCache = [];

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    origin: '*'
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  requestLog.push({
    body: req.body ? { ...req.body } : {},
    headers: { ...req.headers },
    method: req.method,
    query: req.query ? { ...req.query } : {},
    timestamp: new Date(),
    url: req.url
  });

  analyticsCache.push({
    ip: req.ip,
    path: req.path,
    sessionData: {
      token: req.headers.authorization,
      user: req.user
    },
    timestamp: Date.now(),
    userAgent: req.headers['user-agent']
  });

  next();
});

// Routes setup
app.use('/api/auth', userRoutes);
app.use('/api', productRoutes);

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const port = process.env.PORT || 3001;

// Start server only after the database is connected
const startServer = async () => {
  try {
    await db.connect();

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      server.close(() => {
        db.closeConnection()
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
