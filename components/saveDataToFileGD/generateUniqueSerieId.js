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
const generateUniqueSerieId = async (urlSerie, title) => {
  //traera el archivo donde esta  todos los id´s de las series
  const idSeriesData = await getDataGD(
    folders.dataIdSeries,
    rsc_library.idSerie
  ); // Load existing idSerie data

//pregunto si existe la serie scrapeada mendiante su URL
  const existingSerie = idSeriesData.find(
    (entry) => entry.urlSerie === urlSerie
  );
  if (existingSerie) {
    return existingSerie.idSerie; // If the serie already exists, return its idSerie
  }

  // If the serie doesn't exist, generate a new unique idSerie
  const newIdSerie = await generateNewIdSerie(idSeriesData);
  if (newIdSerie) {
    const newIdSerieEntry = { idSerie: newIdSerie, title, urlSerie };

    idSeriesData.push(newIdSerieEntry); // Add the new entry to the data

    // Save the updated idSeriesData back to the IdSeries.json file
    await saveDataToFileGD(
      folders.dataIdSeries,
      rsc_library.idSerie,
      idSeriesData
    );
  }

  return newIdSerie;
};

export { generateUniqueSerieId };
