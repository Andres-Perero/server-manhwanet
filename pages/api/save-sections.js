//save-sections
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { scrapeData } from "../../components/scraperDataInit/scraperDataInit";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { refreshSerieDetails } from "../../components/saveDataToFileGD/updateSeriesDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log("Actualizando datos de seccion agregados");
    await downloadChromeExecutableIfNeeded();
    const sectionElements = await scrapeData();
    await saveDataToFileGD(
      folders.sections,
      rsc_library.sections,
      sectionElements
    );
    let seriesUpdate = [];
    let sectionUpdate = [];
    if (sectionElements) {
      for (const section of sectionElements) {
        for (const serie of section.articles) {
          console.log("================================================");
          console.log(serie.title);
          const idSerie = await refreshSerieDetails(serie);
          seriesUpdate.push({ idSerie, ...serie });
          console.log("================================================");
        }
        const updatedSection = {
          ...section,
          articles: seriesUpdate,
        };
        sectionUpdate.push(updatedSection);
      }
      await saveDataToFileGD(
        folders.sections,
        rsc_library.sections,
        sectionUpdate
      );
      console.log("se completo el scraper de la seccion de recien agregados");
    }
    // Envía los datos como respuesta en formato JSON
    res
      .status(200)
      .json({ data: "Datos actualizados de la seccion recien agregados" });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
