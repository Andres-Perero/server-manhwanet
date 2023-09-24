//save-rsc
import { scraperFilterStatusTagsPagination } from "../../components/scraperFilterStatusTagsPagination/scraperFilterStatusTagsPagination"; // Ajusta la ruta a tu scraper
import { saveDataToFileGD } from "../../components/saveDataToFileGD/saveDataToFileGD";
import { downloadChromeExecutableIfNeeded } from "../../resources/getChrome";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }
  try {
    await downloadChromeExecutableIfNeeded();
    const { filterOptionsStatus, filterOptionsTags, highestPageLink } =
      await scraperFilterStatusTagsPagination();
    // Guarda los datos en archivos utilizando tu función saveUpdateDataToFile
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.filterStatus,
      filterOptionsStatus
    );
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.filterTags,
      filterOptionsTags
    );
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.pagination,
      highestPageLink
    );
    console.log("se actualizaron los recursos de la base de datos");
    // Envía el objeto con todos los datos en la respuesta
    res.status(200).json({
      data: "se actualizaron los sigts archivos",
      status: rsc_library.filterStatus,
      tags: rsc_library.filterTags,
      pagination: rsc_library.pagination,
      value: highestPageLink,
    });
  } catch (error) {
    console.error("Error al obtener los datos de filtros de estado:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los datos de filtros de estado" });
  }
}
