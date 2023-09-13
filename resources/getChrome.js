import { downloadFilesFromDrive } from "../resourcesGD/readFileContentFromDrive";

const fs = require("fs");
const idZIP = "1CswkD-UJne-e46w64l_rjcYVXkSTiFZ3"; //"1btnshT2Jx8KkL5DGu3jty_JYhy2vhBRc";
const downloadChromeExecutableIfNeeded = async () => {
  const localFilePath = "./chrome/Chrome.exe";

  if (!fs.existsSync(localFilePath)) {
    // Si el archivo Chrome.exe no existe, descárgalo
    await downloadFilesFromDrive(idZIP);
    if (fs.existsSync(localFilePath)) {
      console.log("El archivo Chrome.exe ha sido descargado.");
      return { data: "Chrome.exe recien descargado" };
    }
  } else {
    console.log(
      "El archivo Chrome.exe ya existe, no es necesario descargarlo."
    );
    return { data: "Chrome.exe ya existe" };
  }
};

export { downloadChromeExecutableIfNeeded };
