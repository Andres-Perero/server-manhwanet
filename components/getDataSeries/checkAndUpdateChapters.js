import {
  getAllFilesInFolder,
  readFileContentFromDrive,
} from "../../resourcesGD/readFileContentFromDrive";
import folders from "../../data-googleapis/route-rsc-files.json";
import { scraperSerieDetailChapter } from "../scraperSerieDetailChapters/scraperSerieDetailChapter";
import { saveDataToFileGD } from "../saveDataToFileGD/saveDataToFileGD";

const checkAndUpdateChaptersProcess = async (chapters) => {
  let updatedChapters = [];
  let booleanUpdateData = false;
  for (const chapter of chapters) {
    if (chapter.imageUrls.length === 0) {
      try {
        console.log(chapter.numChapter);
        booleanUpdateData = true;
        const updatedChapterDetail = await scraperSerieDetailChapter(
          chapter.urlChapter,
          chapter.numChapter
        );

        updatedChapters.push(updatedChapterDetail);
      } catch (error) {
        console.error(
          `Error al obtener imágenes para el Capítulo ${chapter.numChapter}:`,
          error
        );
      }
    } else {
      updatedChapters.push(chapter);
    }
  }

  // // Mantener el orden original de los capítulos
  // updatedChapters.sort(
  //   (a, b) =>
  //     chapters.findIndex((c) => c === a) - chapters.findIndex((c) => c === b)
  // );

  return { booleanUpdateData, updatedChapters };
};

const checkAndUpdateChapters = async () => {
  try {
    // Obtén la lista de archivos y carpetas en la carpeta actual
    const items = await getAllFilesInFolder(folders.dataSeriesDetailsChapters);

    if (items) {
      for (const item of items) {
        const serieChaptersDetail = await readFileContentFromDrive(item.id);
        if (serieChaptersDetail) {
          console.log(
            serieChaptersDetail.idSerie,
            ":",
            serieChaptersDetail.title
          );
          const { booleanUpdateData, updatedChapters } =
            await checkAndUpdateChaptersProcess(serieChaptersDetail.chapters);
          if (booleanUpdateData) {
            const newItem = {
              ...serieChaptersDetail,
              chapters: updatedChapters,
            };
            await saveDataToFileGD(
              folders.dataSeriesDetailsChapters,
              serieChaptersDetail.idSerie,
              newItem
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener detalles de la serie:", error);
    return null; // Retorna null en caso de error
  }
};

export { checkAndUpdateChapters };
