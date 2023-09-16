const { scraperSerieDetailChapter } = require("./scraperSerieDetailChapter");

const serieDetailChapters = async (idSerie,title, urlSerie, chapters) => {
  try {
    const chapterDetailsList = []; // Aquí almacenaremos los detalles de los capítulos
    for (const chapter of chapters) {
      console.log("chapter: " + chapter.chapter);
      try {
        const chapterDetails = await scraperSerieDetailChapter(
          chapter.urlChapter
        );
        if (chapterDetails) {
          chapterDetailsList.push(chapterDetails);
        }
      } catch (error) {
        console.error("Error en el scraping del capítulo:", error);
        // Puedes manejar el error de manera apropiada aquí si es necesario.
        // Por ejemplo, puedes registrar el error y continuar con la siguiente iteración.
      }
    }

    const serieDetailsChapters = {
      idSerie:idSerie,
      title: title,
      urlSerie: urlSerie,
      chapters: chapterDetailsList,
    };
    return serieDetailsChapters; // Devolvemos los detalles completos de la serie
  } catch (error) {
    console.error("Error en el scraping del enlace:", error);
    // Aquí deberías manejar el error de manera apropiada.
    return {};
  }
};

export { serieDetailChapters };
