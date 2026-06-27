const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Serve static frontend files in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Log requests
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Import API Routes
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const sitesRouter = require('./routes/sites');
const reportsRouter = require('./routes/reports');
const aiRouter = require('./routes/ai');
const notificationsRouter = require('./routes/notifications');
const analyticsRouter = require('./routes/analytics');
const exportsRouter = require('./routes/exports');

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/exports', exportsRouter);

// Base Route & Catch-all React fallback
app.get('*', (req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) {
        res.json({ message: 'Site Progress Tracking Dashboard API is active.' });
      }
    });
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'An internal server error occurred.' 
  });
});

// Start Database & Express Server
const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database schemas synchronized.');

    app.listen(PORT, () => {
      console.log(`[Server Running] Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
