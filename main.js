const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function startBackend() {
  const userHome = app.getPath('userData');
  
  // Set up writable directories in user AppData
  const userDbPath = path.join(userHome, 'database.sqlite');
  const userUploadsDir = path.join(userHome, 'uploads');
  
  if (!fs.existsSync(userUploadsDir)) {
    fs.mkdirSync(userUploadsDir, { recursive: true });
  }

  // Copy seeded database to AppData on first launch
  if (!fs.existsSync(userDbPath)) {
    const bundleDbPath = path.join(__dirname, 'backend', 'database.sqlite');
    if (fs.existsSync(bundleDbPath)) {
      try {
        fs.copyFileSync(bundleDbPath, userDbPath);
        console.log('Database initialized successfully in user data.');
      } catch (err) {
        console.error('Failed to copy database:', err);
      }
    }
  }

  // Configure environment variables for the backend
  process.env.DB_STORAGE = userDbPath;
  process.env.UPLOADS_DIR = userUploadsDir;
  process.env.PORT = '5001';
  process.env.NODE_ENV = 'production';

  // Start Express API server directly inside Electron process
  console.log('Starting backend server...');
  require('./backend/server.js');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "ConstructAI | Site Progress Tracking Dashboard"
  });

  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev ? 'http://localhost:3000' : 'http://localhost:5001';

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // Start backend server first
  startBackend();
  // Wait brief moment for Express to listen before creating BrowserWindow
  setTimeout(createWindow, 1000);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
