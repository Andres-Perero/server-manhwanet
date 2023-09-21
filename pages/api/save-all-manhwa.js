//save-all-manhwa

import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { updateSeriesDetails } from "../../components/saveDataToFileGD/updateSeriesDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    await downloadChromeExecutableIfNeeded();

    const SeriesPages = await getDataGD(folders.dataSeries, rsc_library.series);

    for (const serie of SeriesPages) {
      if (serie.type === "Manhwa") {
        console.log(serie.title);
        await updateSeriesDetails(serie);
      }
    }
    console.log("================================");
    console.log("Series guardadas.");
    console.log("================================");
    res.status(200).json({
      data: "Se realizo un mapeo de todas las series y capitulos de la biblioteca.",
    });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
