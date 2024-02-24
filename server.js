import express from "express";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import config from "./src/lib/config.js";
import cors from "cors";
import {generatePdfFromUrl} from "./src/utils/pdf/generatePdf.js";


const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.urlencoded({ extended: true, limit: "800mb" }));

app.post("/api/test", (req, res) => {
  res.json({ message: "Holaa" });
});
// app.use("/api/generate-pdf", async (req, res) => {
//   console.log('pdfBuffer')
//   const pdfBuffer = await generatePdfFromUrl({
//     url: req.body.url,
//   });
//   console.log(pdfBuffer)
//   res.status(200).end(pdfBuffer);
  
//   // res.json({ message: "Holaa" });
// });
app.use("/api/generate-pdf", async (req, res) => {
  try {
    const pdfBuffer = await generatePdfFromUrl(req.body.url);
    
    // Configurar los encabezados de la respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');

    // Enviar el buffer del PDF como respuesta
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});


app.use(
  compression({
    level: 9,
    threshold: 0,
    memLevel: 9,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(express.static(path.resolve(__dirname, "dist")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// inicia el servidor
app.listen(config.serverPort, (err) => {
  console.log("a");
  console.log(err);
});
