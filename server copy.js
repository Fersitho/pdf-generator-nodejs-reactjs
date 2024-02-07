import express from "express";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import config from "./src/lib/config.js";
import generatePdf from "./src/utils/pdf/generatePdf.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "800mb" }));

const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://oposiciones-justicia.es"];
const scriptSources2 = ["'self'", "'unsafe-inline'", "https://oposiciones-justicia.es"];
const styleSources = ["'self'", "https:", "'unsafe-inline'"];
const connectSources = ["'self'", "js.stripe.com", "https://oposiciones-justicia.es"];
const connectImgSrc = ["'self'", "'unsafe-inline'"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: scriptSources,
      scriptSrcElem: scriptSources,
      styleSrc: styleSources,
      connectSrc: connectSources,
      imgSrc: connectImgSrc,
      mediaSrc: connectImgSrc,
      frameSrc: scriptSources2,
      "frame-ancestors": ["'self'", "https://masterclass.diazfernando.es", "https://oposiciones-justicia.es"],
    },
  })
);

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

app.use("/generate-pdf", async (req, res) => {
console.log('Entro al generate')
  const pdfBuffer = await generatePdf({
    url: req.body.url
  })



  // res
  //   .status(200)
  //   .set({
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Credential": true,
  //     "Content-type": "application/pdf"
  //   })
  //   .end(pdfBuffer)
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// inicia el servidor
app.listen(config.serverPort);
