//check-chapters

import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { checkAndUpdateChapters } from "../../components/getDataSeries/checkAndUpdateChapters";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log(
      "Checkea y arregla posible caps vacios en el folder de capitulos"
    );
    await downloadChromeExecutableIfNeeded();
    await checkAndUpdateChapters();
    console.log("================================");
    res.status(200).json({
      data: "Datos actualizados en el folder de capitulos, se verifico que los caps tengan url en las imagenes",
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
