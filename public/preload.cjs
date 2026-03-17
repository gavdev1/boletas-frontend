const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes exponer funciones seguras si necesitas comunicación con el main process
  // Por ahora solo exponemos la plataforma para detectar si estamos en Electron
  platform: process.platform,
  
  // Ejemplo de función para notificar al main process
  notify: (message) => ipcRenderer.invoke('notify', message),
  
  // Ejemplo de función para obtener versión de la app
  getVersion: () => ipcRenderer.invoke('get-version')
});
