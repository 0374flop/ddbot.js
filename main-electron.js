const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const main = require('./main');

main.main();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html');
    win.on('close', (e) => {
        main.exit();
    });
}

ipcMain.on('html-data', (event, data) => {
    main.SayChat(data);
});

app.whenReady().then(createWindow);