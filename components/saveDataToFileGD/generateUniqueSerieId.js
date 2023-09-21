const { getDataGD } = require("../../resourcesGD/readFileContentFromDrive");
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

const generateNewIdSerie = async (idSeriesData) => {
  // Find the highest idSerie value in the existing data
  const highestIdSerie = idSeriesData.reduce((maxId, entry) => {
    const id = parseInt(entry.idSerie);
    return id > maxId ? id : maxId;
  }, 0);

  // Generate the new idSerie by incrementing the highest value
  const newIdSerie = highestIdSerie + 1;
  return newIdSerie; // Convert it to a string
};
const generateUniqueSerieId = async (serie, SeriesPagesGD = null) => {
  //traera el archivo donde esta  todos los id´s de las series
  const idSeriesData = SeriesPagesGD//await getDataGD(folders.dataSeries, rsc_library.series); // Load existing idSerie data

  //pregunto si existe la serie scrapeada mendiante su URL
  const existingSerie = await idSeriesData.find(
    (entry) => entry.urlSerie === serie.urlSerie
  );

  if (existingSerie) {
    return existingSerie.idSerie; // If the serie already exists, return its idSerie
  }

  // If the serie doesn't exist, generate a new unique idSerie
  const newIdSerie = await generateNewIdSerie(idSeriesData);
  if (newIdSerie) {
    let title = serie.title;
    let urlSerie = serie.urlSerie;
    let image = serie.image;
    let type = serie.type;

    const newIdSerieEntry = {
      idSerie: newIdSerie,
      title,
      type,
      urlSerie,
      image,
    };

    idSeriesData.push(newIdSerieEntry); // Add the new entry to the data

    
  }

  return idSeriesData;
};

export { generateUniqueSerieId };
