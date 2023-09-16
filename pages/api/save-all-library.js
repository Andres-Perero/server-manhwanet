// pages/api/save-all-library
import { scraperLibrary } from "../../components/scraperSeries/scraperSeries";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";
import { getSeriesDetails } from "../../components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "../../components/getDataSeries/getSeriesChaptersDetails";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { scraperFilterStatusTagsPagination } from "../../components/scraperFilterStatusTagsPagination/scraperFilterStatusTagsPagination";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

async function updateSeriesDetails(serieDetails) {
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
}

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

    const today = new Date().toISOString().split("T")[0];
    const paginationDate = paginationSeries.date.split("T")[0];
    let totalPages = null;
    let SeriesPages = [];

    if (today === paginationDate) {
      totalPages = paginationSeries.value;
      SeriesPages = await getDataGD(folders.dataSeries, rsc_library.series);
    } else {
      const { highestPageLink } = await scraperFilterStatusTagsPagination();
      await saveDataToFileGD(
        folders.resourcesWebScraping,
        rsc_library.pagination,
        highestPageLink
      );
      totalPages = highestPageLink.value;
      SeriesPages = await scraperLibrary(totalPages);
      if (SeriesPages) {
        await saveDataToFileGD(
          folders.dataSeries,
          rsc_library.series,
          SeriesPages
        );
        console.log("Series por verificar y actualizar:" + SeriesPages.length);
      }
    }

    for (const serie of SeriesPages) {
      console.log(serie.title);
      await updateSeriesDetails(serie);
    }

    res.status(200).json({
      data: "Se realizo un mapeo de todas las series y capitulos de la biblioteca.",
    });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
