// index.js
// Archivo principal: SOLO inicializa Express, configura middlewares,
// conecta las rutas y levanta el servidor. No contiene lógica de negocio.

const express = require('express');
const turnosRoutes = require('./routes/turnosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer cuerpos JSON (req.body)
app.use(express.json());

// Sirve la página web (cliente) que está en la carpeta public/
app.use(express.static('public'));

// Conexión de las rutas del recurso "turnos"
app.use('/api/turnos', turnosRoutes);

// Ruta no encontrada -> 404 en formato JSON
app.use((req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe` });
});

// Si el cliente envía un JSON mal formado, responder 400 en vez de 500
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🐾 API Clínica Veterinaria escuchando en http://localhost:${PORT}`);
});
