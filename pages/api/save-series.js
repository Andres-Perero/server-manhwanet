//save-series
import { scraperLibrary } from "../../components/scraperSeries/scraperSeries";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { generateUniqueSerieId } from "../../components/saveDataToFileGD/generateUniqueSerieId";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

const generateIDSeriesSaveGD = async (dataSeries, SeriesPagesGD) => {
  try {
    let idSeriesDataSave = [];
    for (let serie of dataSeries) {
      console.log("serie: " + serie.title);
      const { newIdSerie, idSeriesData } = await generateUniqueSerieId(
        serie,
        SeriesPagesGD
      );
      idSeriesDataSave = idSeriesData;
    }
    if (idSeriesDataSave) {
      // Save the updated idSeriesData back to the IdSeries.json file
      await saveDataToFileGD(
        folders.dataSeries,
        rsc_library.series,
        idSeriesDataSave
      );
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
    const totalPages = paginationSeries.value;
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
          console.log("Nuevas series: ",newSeries.length);
          await generateIDSeriesSaveGD(newSeries, SeriesPagesGD);
          console.log(
            "mapeo de las series regien agregadas: " + newSeries.length
          );
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
