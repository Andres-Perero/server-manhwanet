import { getDataGD } from "../../resourcesGD/readFileContentFromDrive";

const folders = require("../../data-googleapis/route-rsc-files.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log(req.query.idSerie);
    const idSerie = req.query.idSerie;
    console.log("Lista de las series alojadas en la web");
    const element = await getDataGD(folders.dataSeriesDetails, idSerie);

    res.status(200).json({
      element,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
