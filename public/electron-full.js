const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development';

// Configuración
const CONFIG = {
  port: 8000,
  host: 'localhost',
  maxRetries: 30,
  retryDelay: 1000
};

let backendProcess = null;
let mainWindow = null;

// Verificar si el servidor está corriendo
function checkServer(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: CONFIG.host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

// Iniciar el servidor backend
async function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor backend...');
    
    // Determinar el comando según la plataforma
    const isWindows = process.platform === 'win32';
    const pythonCmd = isWindows ? 'python' : 'python3';
    
    // Buscar el backend - desde el ejecutable
    const possiblePaths = [
      path.join(process.resourcesPath, 'backend', 'main.py'),
      path.join(__dirname, '..', 'backend', 'main.py'),
      path.join(__dirname, '..', '..', 'backend', 'main.py'),
      path.join(process.cwd(), 'backend', 'main.py')
    ];
    
    let mainScript = null;
    for (const scriptPath of possiblePaths) {
      if (fs.existsSync(scriptPath)) {
        mainScript = scriptPath;
        break;
      }
    }
    
    if (!mainScript) {
      console.log('❌ No se encontró main.py. Buscando en el sistema...');
      // Opción: buscar en directorio actual o subdirectorios
      const searchPaths = [
        path.join(process.cwd(), 'main.py'),
        path.join(process.cwd(), 'backend', 'main.py'),
        path.join(path.dirname(process.execPath), 'backend', 'main.py')
      ];
      
      for (const scriptPath of searchPaths) {
        if (fs.existsSync(scriptPath)) {
          mainScript = scriptPath;
          break;
        }
      }
    }
    
    if (!mainScript) {
      console.log('❌ No se encontró main.py en ninguna ubicación');
      console.log('Por favor, asegúrate de que el backend está disponible');
      reject(new Error('No se encontró main.py'));
      return;
    }
    
    console.log(`📁 Script encontrado: ${mainScript}`);
    
    // Iniciar el proceso Python
    backendProcess = spawn(pythonCmd, [mainScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(mainScript)
    });
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[BACKEND] ${output}`);
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[BACKEND ERROR] ${output}`);
      }
    });
    
    backendProcess.on('error', (error) => {
      console.log(`❌ Error al iniciar backend: ${error.message}`);
      reject(error);
    });
    
    backendProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`❌ Backend se cerró con código ${code}`);
      } else {
        console.log('✅ Backend se cerró correctamente');
      }
    });
    
    // Esperar a que el servidor esté disponible
    let retries = 0;
    const checkInterval = setInterval(async () => {
      const isRunning = await checkServer(CONFIG.port);
      if (isRunning) {
        clearInterval(checkInterval);
        console.log('✅ Servidor backend está corriendo');
        resolve(backendProcess);
      } else if (retries >= CONFIG.maxRetries) {
        clearInterval(checkInterval);
        backendProcess.kill();
        reject(new Error('El servidor no pudo iniciarse después de varios intentos'));
      } else {
        retries++;
        console.log(`⏳ Esperando servidor... (${retries}/${CONFIG.maxRetries})`);
      }
    }, CONFIG.retryDelay);
  });
}

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    autoHideMenuBar: true
  });

  // Cargar la aplicación
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }
    app.quit();
  });
}

// Crear menú personalizado
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            if (backendProcess) {
              backendProcess.kill('SIGTERM');
            }
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Servidor',
      submenu: [
        {
          label: 'Reiniciar Backend',
          accelerator: 'CmdOrCtrl+R',
          click: async () => {
            if (backendProcess) {
              backendProcess.kill('SIGTERM');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            try {
              await startBackend();
              console.log('✅ Backend reiniciado');
            } catch (error) {
              console.log('❌ Error al reiniciar backend:', error);
            }
          }
        },
        {
          label: 'Estado del Servidor',
          click: async () => {
            const isRunning = await checkServer(CONFIG.port);
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Estado del Servidor',
              message: `Servidor Backend: ${isRunning ? '✅ Corriendo' : '❌ Detenido'}`,
              detail: `URL: http://${CONFIG.host}:${CONFIG.port}`
            });
          }
        }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forzar Recarga', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Herramientas de Desarrollador', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Restablecer Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Pantalla Completa', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Ventana',
      submenu: [
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Cerrar', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(null, {
              type: 'info',
              title: 'Acerca de Sistema de Boletas',
              message: 'Sistema de Boletas - Versión Completa',
              detail: 'Versión 1.0.0\n\nSistema de gestión de boletas escolares\nIncluye backend automático\nDesarrollado con React y Electron'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(async () => {
  try {
    // Iniciar backend primero
    await startBackend();
    
    // Luego crear la ventana
    createWindow();
    createMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.log('❌ Error al iniciar la aplicación:', error);
    const { dialog } = require('electron');
    dialog.showErrorBox('Error de Inicio', 
      'No se pudo iniciar el servidor backend.\n\n' +
      'Asegúrate de que:\n' +
      '• Python esté instalado\n' +
      '• El archivo main.py exista\n' +
      '• El puerto 8000 esté disponible\n\n' +
      'Error: ' + error.message
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }
    app.quit();
  }
});

// Seguridad
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
  
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// IPC handlers
ipcMain.handle('get-backend-status', async () => {
  return await checkServer(CONFIG.port);
});

ipcMain.handle('restart-backend', async () => {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return await startBackend();
});
