import express from "express";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import config from "./src/lib/config.js";
import generatePdf from "./src/utils/pdf/generatePdf.js";
// import testRouter from "./src/routers/playPdf.js"
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const testRouter = require("./src/routers/playPdf.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: '800mb' }));
app.use(express.json())

// const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://oposiciones-justicia.es", "http://localhost:4040", "http://localhost:4040/"];
// const scriptSources2 = ["'self'", "'unsafe-inline'", "https://oposiciones-justicia.es", "http://localhost:4040", "http://localhost:4040/"];
// const styleSources = ["'self'", "https:", "'unsafe-inline'", "http://localhost:4040", "http://localhost:4040/"];
// const connectSources = ["'self'", "js.stripe.com", "https://oposiciones-justicia.es", "http://localhost:4040", "http://localhost:4040/"];
// const connectImgSrc = ["'self'", "'unsafe-inline'", "http://localhost:4040", "http://localhost:4040/"];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self', 'http://localhost:4040'"],
//       scriptSrc: scriptSources,
//       scriptSrcElem: scriptSources,
//       styleSrc: styleSources,
//       connectSrc: connectSources,
//       imgSrc: connectImgSrc,
//       mediaSrc: connectImgSrc,
//       frameSrc: scriptSources2,
//       "frame-ancestors": ["'self'", "https://masterclass.diazfernando.es", "https://oposiciones-justicia.es", "http://localhost:4040"],
//     },
//   })
// );

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


app.use("/api", testRouter);

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});


// inicia el servidor pawn!
app.listen(config.serverPort);
