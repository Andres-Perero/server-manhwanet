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

const generateUniqueSerieId = async (serie, datasetSeries) => {
  //pregunto si existe la serie scrapeada mendiante su URL
  const existingSerie = await datasetSeries.find(
    (entry) => entry.urlSerie === serie.urlSerie
  );

  if (existingSerie) {
    return { idSerie: existingSerie.idSerie, datasetSeries: null }; // If the serie already exists, return its idSerie
  }

  // If the serie doesn't exist, generate a new unique idSerie
  const newIdSerie = await generateNewIdSerie(datasetSeries);
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

    datasetSeries.push(newIdSerieEntry); // Add the new entry to the data
    return { idSerie: newIdSerie, datasetSeries };
  }
};

export { generateUniqueSerieId };
