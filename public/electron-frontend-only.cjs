const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

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
      preload: path.join(__dirname, 'preload.cjs')
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

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
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
          label: 'Estado del Conexión',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Estado de Conexión',
              message: 'Backend Externo',
              detail: 'Esta aplicación solo incluye el frontend.\n\n' +
                      'Para usar el sistema:\n' +
                      '1. Inicia el backend Python manualmente\n' +
                      '2. El backend debe correr en http://localhost:8000\n' +
                      '3. Esta aplicación se conectará automáticamente'
            });
          }
        },
        {
          label: 'Cómo Iniciar Backend',
          click: () => {
            const { dialog, shell } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Instrucciones para Backend',
              message: 'Pasos para iniciar el backend:',
              detail: '1. Abre una terminal\n' +
                      '2. Navega a la carpeta backend\n' +
                      '3. Ejecuta: python main.py\n' +
                      '4. Espera a que inicie el servidor\n' +
                      '5. El servidor estará en http://localhost:8000'
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
              message: 'Sistema de Boletas - Frontend',
              detail: 'Versión 1.0.0\n\n' +
                      'Aplicación de escritorio para el frontend.\n\n' +
                      'Requiere backend Python corriendo por separado.\n' +
                      'Desarrollado con React y Electron.'
            });
          }
        },
        {
          label: 'Instrucciones',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(null, {
              type: 'info',
              title: 'Instrucciones de Uso',
              message: 'Cómo usar el Sistema de Boletas:',
              detail: '1. PRIMERO: Inicia el backend Python\n' +
                      '   - Abre terminal\n' +
                      '   - cd backend\n' +
                      '   - python main.py\n\n' +
                      '2. LUEGO: Inicia esta aplicación\n' +
                      '   - Doble clic en este ejecutable\n' +
                      '   - La app se conectará automáticamente\n\n' +
                      '3. LISTO: Usa el sistema normalmente'
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
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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
