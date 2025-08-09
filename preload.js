const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendData: (data) => ipcRenderer.send('html-data', data)
});