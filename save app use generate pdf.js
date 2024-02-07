app.use("/generate-pdf", async (req, res) => {
  console.log("Entro al generate");
//   const pdfBuffer = await generatePdf({
//     url: req.body.url,
//   });

//   res.status(404).json({
//     status: "Error",
//     message: "Algo fallo, puede ver el error completo:.",
//     error: error,
//   });
  res.status(201).json({
    status: "Success",
    message: "Usuario creado correctamente.",
    error: null,
  });
//   res.status(200).end(pdfBuffer);
});
