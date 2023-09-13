const { google } = require("googleapis");
const data_key = require("../data-googleapis/storage-web-scraping-396800-96043ff114f4.json");
const fs = require('fs');
// Configurar la autenticación para la cuenta de servicio
const auth = new google.auth.GoogleAuth({
  credentials: data_key,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Buscar el archivo por su nombre y en una carpeta específica
async function findFileInFolder(folderId, filename) {
  const drive = google.drive({ version: "v3", auth });
  let nextPageToken = null;

  try {
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and name = '${filename}'`,
        pageToken: nextPageToken,
      });

      const matchingFiles = response.data.files.filter(
        (file) => file.name === filename
      );

      if (matchingFiles.length > 0) {
        return matchingFiles[0]; // Devuelve el primer archivo encontrado
      }

      nextPageToken = response.data.nextPageToken; // Obtiene el token para la siguiente página
    } while (nextPageToken); // Repite el proceso si hay más páginas

    console.log("Archivo no encontrado en la carpeta.");
    return null;
  } catch (error) {
    console.error("Error al buscar el archivo:", error.message);
    return null;
  }
}

// Leer el contenido de un archivo en Google Drive por su ID
async function readFileContentFromDrive(fileId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const response = await drive.files.get({ fileId, alt: "media" });
    return response.data;
  } catch (error) {
    console.error("Error al leer el contenido del archivo:", error.message);
    return null;
  }
}

// Llama a la función utilizando async/await
async function getDataGD(folderId, filename) {
  try {
    const file = await findFileInFolder(folderId, filename);
    if (file) {
      const content = await readFileContentFromDrive(file.id);
      if (content) {
        return content;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Obtener todos los elementos (archivos) de una carpeta específica en Google Drive
async function getAllFilesInFolder(folderId) {
  const drive = google.drive({ version: "v3", auth });
  const pageSize = 100; // Cantidad de archivos por página

  let allFiles = [];
  let nextPageToken = null;

  try {
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        pageSize: pageSize,
        pageToken: nextPageToken,
      });

      const filesInPage = response.data.files;
      allFiles = allFiles.concat(filesInPage);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return allFiles;
  } catch (error) {
    console.error(
      "Error al obtener los archivos de la carpeta:",
      error.message
    );
    return [];
  }
}


async function downloadFilesFromDrive(folderId, parentPath = '') {
  const drive = google.drive({ version: 'v3', auth });

  try {
    // Obtén la lista de archivos y carpetas en la carpeta actual
    const items = await getAllFilesInFolder(folderId);

    // Directorio local donde guardar los archivos (en la carpeta "Chrome" de la raíz)
    const localDirectory = './Chrome/';


    // Itera sobre los elementos
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        // Si es una carpeta, llama recursivamente a la función para descargar sus archivos
        const subfolderId = item.id;
        const subfolderName = item.name;
        const subfolderPath = `${parentPath}${subfolderName}/`;

        await downloadFilesFromDrive(subfolderId, subfolderPath);
      } else {
        // Si es un archivo, descárgalo
        const fileId = item.id;
        const fileName = item.name;
        const localFilePath = `${localDirectory}${parentPath}${fileName}`;

        const response = await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream' }
        );

        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(`Archivo descargado: ${localFilePath}`);
      }
    }

    console.log(`Descarga de archivos en ${parentPath} completada.`);
  } catch (error) {
    console.error('Error al descargar archivos:', error.message);
  }
}


export { getDataGD, readFileContentFromDrive, getAllFilesInFolder, downloadFilesFromDrive };
