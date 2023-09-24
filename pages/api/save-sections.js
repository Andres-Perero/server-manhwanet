//save-sections
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { scrapeData } from "../../components/scraperDataInit/scraperDataInit";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";
import { refreshSerieDetails } from "../../components/saveDataToFileGD/updateSeriesDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log("Actualizando datos de seccion agregados recientes");
    await downloadChromeExecutableIfNeeded();
    const sectionElements = await scrapeData();

    if (sectionElements) {
      for (const section of sectionElements) {
        for (const serie of section.articles) {
          console.log(serie.title);
          await refreshSerieDetails(serie);
          console.log("================================================");
        }

        console.log("se completo el scraper de la seccion de recien agregados");
      }
      const dataSeries = await getDataGD(
        folders.dataSeries,
        rsc_library.series
      );
      let newSections = [];

      for (const section of sectionElements) {
        let updatedArticles = [];

        for (const article of section.articles) {
          const matchingDataSerie = dataSeries.find(
            (dataSerie) => dataSerie.urlSerie === article.urlSerie
          );

          if (matchingDataSerie) {
            updatedArticles.push({
              ...article,
              idSerie: matchingDataSerie.idSerie,
            });
          }
        }

        const updatedSection = {
          ...section,
          articles: updatedArticles,
        };

        newSections.push(updatedSection);
      }
      await saveDataToFileGD(
        folders.sections,
        rsc_library.sections,
        newSections
      );
    }
    // Envía los datos como respuesta en formato JSON
    res
      .status(200)
      .json({ data: "Datos actualizados de la seccion recien agregados" });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
