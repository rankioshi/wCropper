import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { cropImage } from './cropper';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);


// 1. Handler para abrir a caixa de diálogo e retornar o caminho do arquivo
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Selecione uma imagem',
    properties: ['openFile'],
    filters: [{ name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }],
  });

  if (canceled || filePaths.length === 0) {
    return null; // Retorna nulo se o usuário cancelar
  }
  return filePaths[0]; // Retorna apenas o caminho do arquivo
});

// 2. Handler para receber todos os dados e iniciar o recorte
ipcMain.handle('crop:start', async (event, options) => {
  const { filePath, columns, rows } = options;
  
  if (!filePath || !columns || !rows) {
    throw new Error("Dados insuficientes para iniciar o recorte.");
  }

  // Chama a função de recorte com todos os parâmetros
  return await cropImage(filePath, columns, rows);
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});