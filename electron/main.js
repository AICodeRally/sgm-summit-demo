const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const waitOn = require('wait-on');

// Environment configuration
const isDev = !app.isPackaged; // True if running from source, false if packaged
const PORT = process.env.PORT || 3003;
const SERVER_URL = `http://localhost:${PORT}`;

console.log('[Electron] Running in', isDev ? 'development' : 'production', 'mode');
console.log('[Electron] isPackaged:', app.isPackaged);

let mainWindow = null;
let serverProcess = null;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'SGM - Sales Governance Management',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Load the app
  mainWindow.loadURL(SERVER_URL);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'SGM',
      submenu: [
        {
          label: 'About SGM',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About SGM',
              message: 'Sales Governance Management',
              detail: 'Version 1.0.0\n\nPrivacy-first compensation governance platform.\n\n© 2026 BHG Analytics',
              buttons: ['OK'],
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/settings');
            }
          },
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Plan',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/plans/new');
            }
          },
        },
        {
          label: 'Open Data Folder',
          click: () => {
            const dataPath = path.join(app.getPath('userData'), 'data');
            shell.openPath(dataPath);
          },
        },
        { type: 'separator' },
        {
          label: 'Export Data...',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export SGM Data',
              defaultPath: path.join(app.getPath('downloads'), 'sgm-backup.zip'),
              filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
            });

            if (!result.canceled && result.filePath) {
              mainWindow.webContents.send('export-data', result.filePath);
            }
          },
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: 'Go',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.send('navigate', '/'),
        },
        {
          label: 'Plans',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.send('navigate', '/plans'),
        },
        {
          label: 'Templates',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.send('navigate', '/templates'),
        },
        {
          label: 'Documents',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow.webContents.send('navigate', '/documents'),
        },
        {
          label: 'Policies',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow.webContents.send('navigate', '/policies'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.sgm.com');
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/bhg/sgm/issues');
          },
        },
        { type: 'separator' },
        {
          label: 'Privacy Policy',
          click: () => {
            shell.openExternal('https://sgm.com/privacy');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Start the Next.js server
 */
async function startServer() {
  return new Promise((resolve, reject) => {
    const dataPath = path.join(app.getPath('userData'), 'data');

    // Ensure data directories exist
    fs.mkdirSync(path.join(dataPath, 'documents'), { recursive: true });
    fs.mkdirSync(path.join(dataPath, 'plans'), { recursive: true });

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: PORT.toString(),
      DATABASE_URL: `file:${path.join(dataPath, 'sgm.db')}`,
      DOCUMENT_ROOT: path.join(dataPath, 'documents'),
      PLAN_ROOT: path.join(dataPath, 'plans'),
      STORAGE_MODE: 'local_sqlite',
      ENABLE_DEMO_DATA: 'false',
    };

    console.log('Starting Next.js server...');
    console.log('Data path:', dataPath);
    console.log('isDev:', isDev);

    if (isDev) {
      // In dev mode, use npm run dev (concurrently already started it)
      console.log('Development mode: Server should already be running from concurrently');

      // Wait for server to be ready
      console.log('Waiting for server to be ready...');
      waitOn({
        resources: [SERVER_URL],
        timeout: 60000,
        interval: 1000,
      })
        .then(() => {
          console.log('Server is ready!');
          resolve();
        })
        .catch(reject);

      return;
    }

    // Production mode: spawn the server
    const serverPath = path.join(process.resourcesPath, 'app', 'node_modules', '.bin', 'next');
    const args = ['start', '-p', PORT.toString()];

    console.log('Production mode: Starting Next.js server...');
    console.log('Server path:', serverPath);
    console.log('Args:', args);

    serverProcess = spawn(serverPath, args, {
      env,
      cwd: path.join(process.resourcesPath, 'app'),
      stdio: 'inherit',
    });

    serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      console.log('Server process exited with code:', code);
    });

    // Wait for server to be ready
    console.log('Waiting for server to be ready...');
    waitOn({
      resources: [SERVER_URL],
      timeout: 60000,
      interval: 1000,
    })
      .then(() => {
        console.log('Server is ready!');
        resolve();
      })
      .catch(reject);
  });
}

/**
 * Stop the Next.js server
 */
function stopServer() {
  if (serverProcess) {
    console.log('Stopping Next.js server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

/**
 * App ready event
 */
app.whenReady().then(async () => {
  try {
    // Start the Next.js server
    await startServer();

    // Create the window
    createWindow();

    // Handle macOS activation
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Startup Error', `Failed to start SGM: ${error.message}`);
    app.quit();
  }
});

/**
 * App quit events
 */
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

/**
 * Handle IPC events from renderer
 */
ipcMain.handle('get-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

/**
 * Error handling
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});
