import puppeteer from "puppeteer";

export async function generatePdfFromUrl(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4" }); // No se especifica la ruta, el PDF se generará en memoria
  await browser.close();
  console.log(`PDF generado desde la URL: ${url}`);
  
  return pdfBuffer; // Devolver el buffer del PDF generado
}


const generatePdf = async ({ url }) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 750,
      height: 500,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: false,
      isLandscape: false,
    },
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  await page.emulateMediaType("screen");

  // Esperar la generación del PDF y devolverlo
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { left: "0.5cm", top: "2cm", right: "0.5cm", bottom: "2cm" },
  });

  await browser.close();
  return pdf;
};

export default generatePdf;
