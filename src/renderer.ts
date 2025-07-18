

// Referências aos elementos do HTML
const selectImageBtn = document.getElementById('select-image-btn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

const cropSettingsDiv = document.getElementById('crop-settings') as HTMLDivElement;
const selectedFileP = document.getElementById('selected-file') as HTMLParagraphElement;
const columnsInput = document.getElementById('columns-input') as HTMLInputElement;
const rowsInput = document.getElementById('rows-input') as HTMLInputElement;
const startCropBtn = document.getElementById('start-crop-btn') as HTMLButtonElement;

// Variável para armazenar o caminho do arquivo selecionado
let selectedFilePath: string | null = null;

// Função para resetar a UI para o estado inicial
function resetUI() {
    statusDiv.textContent = '';
    statusDiv.classList.remove('error');
    cropSettingsDiv.classList.add('hidden');
    selectImageBtn.classList.remove('hidden');
    selectedFilePath = null;
}

// 1. Evento para o botão de SELECIONAR IMAGEM
if (selectImageBtn) {
    selectImageBtn.addEventListener('click', async () => {
        try {
            // Chama o main process para abrir a caixa de diálogo
            const filePath = await window.api.selectFile();
            
            if (filePath) {
                // Se um arquivo foi selecionado, guarda o caminho e atualiza a UI
                selectedFilePath = filePath;
                const fileName = filePath.split(/\/|\\/).pop(); // Pega apenas o nome do arquivo
                selectedFileP.textContent = `File selected: ${fileName}`;
                
                // Esconde o botão de seleção e mostra as opções de recorte
                selectImageBtn.classList.add('hidden');
                cropSettingsDiv.classList.remove('hidden');
                statusDiv.textContent = ''; // Limpa status anterior
            }
        } catch (error: any) {
            statusDiv.textContent = `Error selecting file: ${error.message}`;
            statusDiv.classList.add('error');
        }
    });
}

// 2. Evento para o botão de INICIAR RECORTE
if (startCropBtn) {
    startCropBtn.addEventListener('click', async () => {
        // Validação dos inputs
        if (!selectedFilePath) {
            statusDiv.textContent = 'Erro: No files were selected.';
            statusDiv.classList.add('error');
            return;
        }

        const columns = parseInt(columnsInput.value, 10);
        const rows = parseInt(rowsInput.value, 10);

        if (isNaN(columns) || isNaN(rows) || columns < 1 || rows < 1) {
            statusDiv.textContent = 'Error: Columns and rows must be numbers greater than zero.';
            statusDiv.classList.add('error');
            return;
        }


        try {
            statusDiv.textContent = 'Processing. . .';
            statusDiv.classList.remove('error');
            startCropBtn.disabled = true; // Desabilita o botão enquanto processa

            // Chama o main process com todos os dados
            const resultMessage = await window.api.startCrop({
                filePath: selectedFilePath,
                columns,
                rows,
            });


            statusDiv.textContent = resultMessage;
            setTimeout(resetUI, 5000); // Reseta a UI após 5 segundos

        } catch (error: any) {
            statusDiv.textContent = `Erro: ${error.message}`;
            statusDiv.classList.add('error');
        } finally {
            startCropBtn.disabled = false; // Reabilita o botão no final
        }
    });
}
