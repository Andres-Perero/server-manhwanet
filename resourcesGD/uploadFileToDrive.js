const { google } = require("googleapis");
const data_key = require("../data-googleapis/storage-web-scraping-396800-96043ff114f4.json");

// Configurar la autenticación para la cuenta de servicio
const auth = new google.auth.GoogleAuth({
  credentials: data_key, // Usamos el contenido del archivo JSON como credenciales
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Subir un archivo a Google Drive
async function uploadFileToDrive(folder, filename, fileContent) {
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: filename,
    mimeType: "application/json",
    parents: [folder],
  };
  const media = {
    mimeType: "application/json",
    body: fileContent,
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
  } catch (error) {
    console.error("Error al subir el archivo a Google Drive:", error.message);
  }
}

export { uploadFileToDrive };
