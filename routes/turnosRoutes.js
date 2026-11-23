// routes/turnosRoutes.js
// Capa de RUTAS: solo define los endpoints y los asocia a su controlador.

const express = require('express');
const turnosController = require('../controllers/turnosController');

const router = express.Router();

router.get('/', turnosController.listarTurnos);        // GET  /api/turnos
router.get('/:id', turnosController.obtenerTurno);     // GET  /api/turnos/:id
router.post('/', turnosController.crearTurno);         // POST /api/turnos

module.exports = router;
