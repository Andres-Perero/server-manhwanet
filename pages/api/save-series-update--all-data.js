// handler.js
import { scraperLibrary } from "../../components/scraperSeries/scraperSeries";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";
import { getSeriesDetails } from "../../components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "../../components/getDataSeries/getSeriesChaptersDetails";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

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

    const SeriesPages = await scraperLibrary(totalPages);
    if (SeriesPages) {
      const { fileFound, data } = await saveDataToFileGD(
        folders.dataSeries,
        rsc_library.series,
        SeriesPages
      );

      const newSeries = SeriesPages.filter(
        (newItem) =>
          !data.some((oldItem) => oldItem.urlSerie === newItem.urlSerie)
      );

      if (newSeries.length === 0) {
        return res
          .status(200)
          .json({ data: "datos se mantienen actualizados" });
      }

      console.log("Series por actualizar:" + newSeries.length);

      for (const series of newSeries) {
        const { details } = await getSeriesDetails(series);
        if (details) {
          await getSeriesChaptersDetails(details);
        }
      }
    }

    res.status(200).json({ data: "datos se actualizaron correctamente" });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
