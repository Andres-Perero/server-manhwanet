import { getSerieDetailChapters } from "../../components/scraperSerieDetailChapters/serieDetailChapters";
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD"; // Asegúrate de tener una función para leer el archivo existente
import folders from "../../data-googleapis/route-rsc-files.json";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";

const getSerieChaptersDetail = async (prevDataSerieGD, dataSerieGD) => {
  try {
    const existingData = await getDataGD(
      folders.dataSeriesDetailsChapters,
      dataSerieGD.idSerie
    );
    let serieDetailChapters = [];
    if (!existingData) {
      serieDetailChapters = await getSerieDetailChapters(
        dataSerieGD.idSerie,
        dataSerieGD.title,
        dataSerieGD.urlSerie,
        dataSerieGD.chapters
      );

      if (serieDetailChapters) {
        // Guarda el contenido actualizado en el archivo
        await saveDataToFileGD(
          folders.dataSeriesDetailsChapters,
          dataSerieGD.idSerie,
          serieDetailChapters
        );
      }
      return null;
    } else {
      if (existingData.urlSerie === dataSerieGD.urlSerie) {
        let newChapters = [];
        if (prevDataSerieGD && Object.keys(prevDataSerieGD).length > 0) {
          newChapters = await dataSerieGD.chapters.filter(
            (newChapter) =>
              !prevDataSerieGD.chapters?.some(
                (prevChapter) => prevChapter.chapter === newChapter.chapter
              )
          );
          if (Object.keys(newChapters).length === 0) {
            console.log("Capitulos: Se mantienen actualizados");
            return null;
          }
          //datos de caps a actualizar
          console.log(newChapters.length," capitulos a actualizar");

          serieDetailChapters = await getSerieDetailChapters(
            dataSerieGD.idSerie,
            dataSerieGD.title,
            dataSerieGD.urlSerie,
            newChapters
          );
          if (serieDetailChapters) {
            const updatedData = {
              ...serieDetailChapters,
              chapters: [
                ...serieDetailChapters.chapters,
                ...existingData.chapters,
              ],
            };
            // Guarda el contenido actualizado en el archivo
            await saveDataToFileGD(
              folders.dataSeriesDetailsChapters,
              serieDetailChapters.idSerie,
              updatedData
            );
            
            return null;
          }
        }
      } else {
        //lo mas problable es que no se entre a esta condicion
        console.log(
          "algo paso, no coinciden las URL de la serie en base con la del scraper"
        );
        console.log("se procede a realizar todo el scraping  de los caps");
        serieDetailChapters = await getSerieDetailChapters(
          dataSerieGD.idSerie,
          dataSerieGD.title,
          dataSerieGD.urlSerie,
          dataSerieGD.chapters
        );
        if (serieDetailChapters) {
          // Guarda el contenido actualizado en el archivo
          await saveDataToFileGD(
            folders.dataSeriesDetailsChapters,
            dataSerieGD.idSerie,
            serieDetailChapters
          );
        }
        return null;
      }
    }
  } catch (error) {
    console.error("Error al obtener detalles de los capítulos:", error);
  }
};

export { getSerieChaptersDetail };
