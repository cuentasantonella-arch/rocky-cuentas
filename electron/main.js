const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Configuración del servidor local
const PORT = 3000;
const DIST_PATH = path.join(__dirname, 'dist');

function createServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_PATH, req.url === '/' ? 'index.html' : req.url);

    const extname = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Para rutas SPA, servir index.html
          fs.readFile(path.join(DIST_PATH, 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          });
        } else {
          res.writeHead(500);
          res.end('Server Error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Rocky Cuentas ejecutándose en http://localhost:${PORT}`);
    console.log(`📡 Otros equipos pueden acceder desde: http://TU-IP:${PORT}`);
  });
}

app.whenReady().then(() => {
  createServer();

  // Abrir ventana principal
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Rocky Cuentas - Gestor de Cuentas Streaming',
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Abrir DevTools en desarrollo
  // mainWindow.webContents.openDevTools();

  app.on('window-all-closed', () => {
    app.quit();
  });
});

// Minimizar a bandeja del sistema
app.on('browser-window-blur', (event) => {
  // No minimizar automáticamente
});
