// Importar las bibliotecas necesarias
const { google } = require("googleapis");
const data_key = require("../data-googleapis/storage-web-scraping-396800-96043ff114f4.json");
import { readFileContentFromDrive,  } from "./readFileContentFromDrive";
import { uploadFileToDrive } from "./uploadFileToDrive";
import { findFileInFolder } from "./readFileContentFromDrive";

// Configurar la autenticación para la cuenta de servicio
const auth = new google.auth.GoogleAuth({
  credentials: data_key,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Modificar el contenido de un archivo en Google Drive por su ID
async function updateFileContent(fileId, newContent) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const media = {
      mimeType: "application/json",
      body: newContent,
    };
    const response = await drive.files.update({
      fileId,
      media: media,
    });
    //console.log("Archivo actualizado en Google Drive: ", response.data.name);
  } catch (error) {
    console.error(
      "Error al actualizar el archivo en Google Drive:",
      error.message
    );
  }
}

async function updateDataGD(folderId, filename, newContent) {
  try {

    const file = await findFileInFolder(folderId, filename);
    let fileFound = false;

    if (file) {
      //console.log("Archivo encontrado: ", file.name);
      const readfile = await readFileContentFromDrive(file.id);

      if (readfile) {
        await updateFileContent(file.id, newContent);
      }
      fileFound = true;
      return { fileFound, data: readfile };
    } else {
      //console.log("Creando archivo: ", filename);
      await uploadFileToDrive(folderId, filename, newContent);
      return { fileFound, data: JSON.parse(newContent) };
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export { updateDataGD };
