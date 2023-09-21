const puppeteer = require("puppeteer-core");
const path = require("path");
const executablePath = path.resolve("./chrome/chrome.exe");
//const executablePath = path.resolve("/var/task/chrome/chrome.exe");
const maxRetries = 5; // Número máximo de reintentos

const scraperSerieDetailChapter = async (urlChapter, numChapter) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const browser = await puppeteer.launch({
        executablePath,
        timeout: 60000,
        headless: true, // Puedes configurar esto según tus necesidades
      });
      const page = await browser.newPage();
      await page.goto(urlChapter, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const scrapedData = await page.evaluate(
        (urlChapter, numChapter) => {
          const chapterImageElements =
            document.querySelectorAll("#chapter_imgs img");
          const imageUrls = Array.from(chapterImageElements)
            .map((img) => img.src)
            .filter((src) => src !== urlChapter); // Filtrar el enlace no deseado

          return {
            numChapter: numChapter, // Incluimos numChapter en el objeto de retorno
            urlChapter: urlChapter,
            imageUrls: imageUrls,
          };
        },
        urlChapter,
        numChapter
      );

      await browser.close();
      return scrapedData;
    } catch (error) {
      console.error("Error en el scraping del enlace:", error);
      retries++;
      console.log(`Reintentando... Intento ${retries} de ${maxRetries}`);
    }
  }

  throw new Error(
    "Error en el scraping del enlace después de múltiples intentos"
  );
};

export { scraperSerieDetailChapter };
