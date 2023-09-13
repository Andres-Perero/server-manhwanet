import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";

export default async function handler(req, res) {
  // Verificar si el archivo Chrome.exe ya existe antes de iniciar la descarga
  const respData = await downloadChromeExecutableIfNeeded();
  res.status(200).json(respData);
}
