import { scraperLibrary } from "../../components/scraperSeries/scraperSeries";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { generateUniqueSerieId } from "../../components/saveDataToFileGD/generateUniqueSerieId";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

const generateIDSeriesSaveGD = async (dataSeries) => {
  try {
    for (let serie of dataSeries) {
      console.log("serie: " + serie.title);
      await generateUniqueSerieId(serie);
    }
  } catch (error) {
    console.error("Error en generateIDSeriesSaveGD:", error);
    throw error; // Re-lanza el error para que sea manejado en un nivel superior
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    await downloadChromeExecutableIfNeeded();
    const paginationSeries = await getDataGD(
      folders.resourcesWebScraping,
      rsc_library.pagination
    );
    const totalPages = 1; //paginationSeries.value;
    const SeriesPagesScraper = await scraperLibrary(totalPages);

    let newSeries = [];

    if (SeriesPagesScraper) {
      const SeriesPagesGD = await getDataGD(
        folders.dataSeries,
        rsc_library.series
      );
      if (SeriesPagesGD) {
        newSeries = SeriesPagesScraper.filter(
          (serieScraper) =>
            !SeriesPagesGD?.some(
              (serieGD) => serieGD.urlSerie === serieScraper.urlSerie
            )
        );
        if (newSeries) {
          console.log(newSeries.length);
          await generateIDSeriesSaveGD(newSeries);
          console.log("mapeo de las series regien agregadas: " + newSeries.length);
        }
      }
    }

    res.status(200).json({
      data: "Se realizó un mapeo de todas las series y capítulos de la biblioteca.",
    });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
