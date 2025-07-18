import { contextBridge, ipcRenderer } from 'electron';

// Tipos para os dados que vamos enviar
export interface CropOptions {
  filePath: string;
  columns: number;
  rows: number;
}


contextBridge.exposeInMainWorld('api', {
  // 1. Apenas para selecionar o arquivo e retornar o caminho
  selectFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFile'),
  // 2. Para iniciar o recorte com todos os dados necessários
  startCrop: (options: CropOptions): Promise<string> => ipcRenderer.invoke('crop:start', options),
});

declare global {
    interface Window {
        api: {
            selectFile: () => Promise<string | null>;
            startCrop: (options: CropOptions) => Promise<string>;
        }
    }
}