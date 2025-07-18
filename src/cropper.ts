import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = 'output';


export async function cropImage(inputImagePath: string, columns: number, rows: number): Promise<string> {
  try {
    console.log(`Starting process to: ${inputImagePath} with ${columns} columns & ${rows} rows.`);
    
    const imageNameWithoutExt = path.basename(inputImagePath, path.extname(inputImagePath));
    const outputSubdirPath = path.join(process.cwd(), OUTPUT_DIR, imageNameWithoutExt);

    await fs.access(inputImagePath);
    await fs.mkdir(outputSubdirPath, { recursive: true });

    const metadata = await sharp(inputImagePath).metadata();
    const { width: imageWidth, height: imageHeight } = metadata;

    if (!imageWidth || !imageHeight) {
      throw new Error('Unable to read image dimensions.');
    }


    const pieceWidth = Math.floor(imageWidth / columns);
    const pieceHeight = Math.floor(imageHeight / rows);

    if (pieceWidth === 0 || pieceHeight === 0) {
      throw new Error('The calculated dimensions for the pieces are zero. Try fewer columns/rows or a larger image.');
    }

    let pieceCount = 0;
   
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const left = col * pieceWidth;
        const top = row * pieceHeight;
        const outputFileName = `parte_${row + 1}_${col + 1}.png`;
        const outputFilePath = path.join(outputSubdirPath, outputFileName);

        await sharp(inputImagePath)
          .extract({ left, top, width: pieceWidth, height: pieceHeight })
          .toFile(outputFilePath);
        
        pieceCount++;
      }
    }
    
    const successMessage = `Process completed! ${pieceCount} pieces created at: '${path.join(OUTPUT_DIR, imageNameWithoutExt)}'.`;
    console.log(successMessage);
    return successMessage;

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Ocorreu um erro:', error.message);
        throw new Error(error.message);
    }
    const errorMessage = 'Unknown error.';
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}
