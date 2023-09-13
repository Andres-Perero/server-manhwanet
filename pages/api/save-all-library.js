// pages/api/save-all-library
import { scraperLibrary } from "@/components/scraperSeries/scraperSeries";
import { getDataGD } from "@/resourcesGD/readFileContentFromDrive";
import { getSeriesDetails } from "@/components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "@/components/getDataSeries/getSeriesChaptersDetails";
import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    await downloadChromeExecutableIfNeeded();
    const paginationSeries = await getDataGD(
      folders.resourcesWebScraping,
      rsc_library.pagination
    );
    const totalPages = paginationSeries.value;

    const SeriesPages = await scraperLibrary(totalPages);
    if (SeriesPages) {
      await saveDataToFileGD(
        folders.dataSeries,
        rsc_library.series,
        SeriesPages
      );
      console.log("Series por verificar y actualizar:" + SeriesPages.length);
    }

    for (const serie of SeriesPages) {
      const { previousSaveDetails, details } = await getSeriesDetails(serie);

      if (details) {
        let newChapters = [];
        if (previousSaveDetails) {
          // Filtrar los nuevos capítulos que no estaban en previousSaveDetails
          newChapters = details.chapters.filter(
            (newChapter) =>
              !previousSaveDetails.chapters?.some(
                (prevChapter) => prevChapter.chapter === newChapter.chapter
              )
          );

          // Crear un nuevo objeto con los nuevos capítulos
          const newDetails = {
            ...details,
            chapters: newChapters,
          };
          await getSeriesChaptersDetails(newDetails);
        } else {
          await getSeriesChaptersDetails(details);
        }
      } else {
        console.log("detailsSerie se mantiene actualizado");
      }
    }
    res.status(200).json({
      data: "Se realizo un mapeo de todas las series y capitulos de la biblioteca.",
    });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
