import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { scrapeData } from "../../components/scraperDataInit/scraperDataInit";
import { getSeriesDetails } from "../../components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "../../components/getDataSeries/getSeriesChaptersDetails";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

async function updateSeriesDetails(serieDetails) {
  try {
    const { previousSaveDetails, details } = await getSeriesDetails(serieDetails);

    if (details) {
      let newChapters = [];
      if (previousSaveDetails) {
        newChapters = details.chapters.filter(
          (newChapter) =>
            !previousSaveDetails.chapters?.some(
              (prevChapter) => prevChapter.chapter === newChapter.chapter
            )
        );
        const newDetails = {
          ...details,
          chapters: newChapters,
        };
        await getSeriesChaptersDetails(newDetails);
      } else {
        await getSeriesChaptersDetails(details);
      }
    } else {
      if (previousSaveDetails) {
        await getSeriesChaptersDetails(previousSaveDetails);
      } else {
        console.log("detailsSerie se mantiene actualizado");
      }
    }
  } catch (error) {
    console.error("Error al actualizar los detalles de la serie:", error);
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log("Actualizando datos de seccion agregados recientes");
    await downloadChromeExecutableIfNeeded();
    const sectionElements = await scrapeData();
    if (sectionElements) {
      await saveDataToFileGD(
        folders.sections,
        rsc_library.sections,
        sectionElements
      );
      for (const section of sectionElements) {
        for (const serie of section) {
          console.log(serie.title);
          await updateSeriesDetails(serie);
        }
    
      }
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
