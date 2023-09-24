// getSeriesDetails.js
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { generateUniqueSerieId } from "../../components/saveDataToFileGD/generateUniqueSerieId";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

const scrapeAndSaveSerieDetails = async (article) => {
  try {
    //scraping de los detalles de la serie segun su url
    const serieDetail = await scraperSerieDetails(article.urlSerie);
    if (serieDetail) {
      //abro la base de datos de la series
      const seriesDataGD = await getDataGD(
        folders.dataSeries,
        rsc_library.series
      );

      const { idSerie, datasetSeries } = await generateUniqueSerieId(
        serieDetail,
        seriesDataGD
      );

      if (datasetSeries) {
        // Save seriesID
        await saveDataToFileGD(
          folders.dataSeries,
          rsc_library.series,
          datasetSeries
        );
      }
      const newDetails = { idSerie, ...serieDetail };
      //Save SerieDetail
      const { fileFound, data } = await saveDataToFileGD(
        folders.dataSeriesDetails,
        newDetails.idSerie,
        newDetails
      );
      if (fileFound) {
        return { prevDataSerieGD: data, dataSerieGD: newDetails };
      }
      //aqui le digo que genere el serieDetailChapters
      return { prevDataSerieGD: [], dataSerieGD: newDetails };
    }
  } catch (error) {
    console.error("Error al obtener detalles de la serie:", error);
    return null; // Retorna null en caso de error
  }
};

export { scrapeAndSaveSerieDetails };
