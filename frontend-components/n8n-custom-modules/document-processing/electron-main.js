const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');

let mainWindow;
let serverProcess;
const PORT = 3002;

// Check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer().use(port);
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') resolve(true);
      else resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
  });
}

// Wait for port to be available
async function waitForPort(port, maxAttempts = 30, delayMs = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const inUse = await isPortInUse(port);
      if (inUse) return true;
    } catch (err) {
      // Continue trying
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
}

// Start the Express server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Express server...');
    
    const serverPath = path.join(__dirname, 'admin.js');
    
    serverProcess = spawn('node', [serverPath], {
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_PORT: PORT,
        ELECTRON_APP: 'true'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let serverReady = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[SERVER] ${output}`);
      
      // Check if server is ready
      if (output.includes('listening') || output.includes('started')) {
        if (!serverReady) {
          serverReady = true;
          resolve();
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[SERVER ERROR] ${data.toString()}`);
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (serverReady) return;
      console.log('⏱️  Server startup timeout, checking port...');
      waitForPort(PORT).then(ready => {
        if (ready) {
          serverReady = true;
          resolve();
        } else {
          reject(new Error('Server startup timeout'));
        }
      });
    }, 15000);
  });
}

// Create the Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3002/document-processor'
    : `http://localhost:${PORT}/document-processor`;

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
    // Retry after a delay
    setTimeout(() => {
      mainWindow.loadURL(startUrl).catch(e => console.error('Retry failed:', e));
    }, 2000);
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// Setup menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://localhost:3002/document-processor');
          }
        },
        {
          label: 'Admin Panel',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`http://localhost:${PORT}/admin`);
            }
          }
        },
        {
          label: 'Open Logs Folder',
          click: () => {
            const logsPath = path.join(__dirname, 'logs');
            if (!fs.existsSync(logsPath)) {
              fs.mkdirSync(logsPath, { recursive: true });
            }
            shell.openPath(logsPath);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('open-documents-folder', async () => {
  const docsPath = path.join(__dirname, 'documents');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }
  await shell.openPath(docsPath);
});

ipcMain.handle('open-external-url', (event, url) => {
  shell.openExternal(url);
});

// App events
app.on('ready', async () => {
  try {
    console.log('📦 Electron app starting...');
    console.log(`🔧 Environment: ${isDev ? 'development' : 'production'}`);
    
    // Start the server
    await startServer();
    console.log(`✅ Server ready on http://localhost:${PORT}`);
    
    // Wait for port to be ready
    const ready = await waitForPort(PORT);
    if (!ready) {
      console.warn('⚠️ Port may not be ready yet, attempting to connect anyway...');
    }
    
    // Create the window
    createWindow();
    createMenu();
  } catch (err) {
    console.error('Failed to start app:', err);
    dialog.showErrorBox('Startup Error', `Failed to start Document Processor:\n\n${err.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running until user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on exit
process.on('exit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An error occurred:\n\n${error.message}`);
});