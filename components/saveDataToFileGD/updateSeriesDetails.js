import { getSerieChaptersDetail } from "../getDataSeries/getSeriesChaptersDetails";
import { scrapeAndSaveSerieDetails } from "../getDataSeries/getSeriesDetails";

async function areObjectsEqual(obj1, obj2) {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!areObjectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

async function refreshSerieDetails(serieDetail) {
  try {
    const { prevDataSerieGD, dataSerieGD } = await scrapeAndSaveSerieDetails(
      serieDetail
    );

    let isEqual = false;

    if (Object.keys(prevDataSerieGD).length > 0) {
      isEqual = await areObjectsEqual(
        prevDataSerieGD.chapters,
        dataSerieGD.chapters
      );
    }

    if (isEqual) {
      console.log(
        "se mantienen actualizados los detalles de: ",
        dataSerieGD.title
      );
    }
    //guardo ahora los caps de la serie
    await getSerieChaptersDetail(prevDataSerieGD, dataSerieGD);
  } catch (error) {
    console.error("Error al actualizar los detalles de la serie:", error);
  }
}

export { refreshSerieDetails };
