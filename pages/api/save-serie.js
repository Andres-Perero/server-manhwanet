//save-serie

import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { refreshSerieDetails } from "../../components/saveDataToFileGD/updateSeriesDetails";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }
  
  try {
    console.log("Actualizando datos de seccion agregados recientes");
    await downloadChromeExecutableIfNeeded();
    const url = req.query.ulr;
    console.log(url);
    await refreshSerieDetails(url);

    console.log("se completo el scraper de la seccion de recien agregados");

    // Envía los datos como respuesta en formato JSON
    res
      .status(200)
      .json({ data: "Datos actualizados de la seccion recien agregados" });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
