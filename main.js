const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // ⚠️ Remplace bien le nom du dossier Angular dans dist/ si différent
  win.loadFile(path.join(__dirname, 'dist/Developpez-le-front-end-en-utilisant-Angular/index.html'));
}

app.whenReady().then(createWindow);
