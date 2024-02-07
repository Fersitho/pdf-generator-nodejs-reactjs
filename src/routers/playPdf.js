import { Router } from "express";
const router = Router(); // Crear un enrutador

router.post("/test", async (req, res) => {
  console.log('Hola paco gaot');
  res.send('¡Hola desde el servidor!'); // Envía una respuesta al cliente
});

export default router; // Exporta el enrutador
