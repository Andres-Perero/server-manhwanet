import { getSeriesChaptersDetails } from "../getDataSeries/getSeriesChaptersDetails";
import { getSeriesDetails } from "../getDataSeries/getSeriesDetails";

async function updateSeriesDetails(serieDetails) {
  try {
    const { previousSaveDetails, details } = await getSeriesDetails(
      serieDetails
    );

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

export { updateSeriesDetails };
