// controllers/turnosController.js
// Capa de CONTROLADORES: recibe la petición (req), valida los datos de entrada,
// llama al servicio y responde (res) con el código HTTP adecuado.
// No hace cálculos de negocio: eso lo hace services/.

const turnosService = require('../services/turnosService');

const CAMPOS_TEXTO_OBLIGATORIOS = ['nombreCliente', 'nombreMascota', 'especie', 'tipoServicio', 'fechaHora'];

// Revisa el cuerpo del POST y devuelve una lista de errores (vacía si todo está bien)
function validarTurno(body) {
  const errores = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo de la petición debe ser un objeto JSON'];
  }

  // 1. Campos de texto obligatorios
  for (const campo of CAMPOS_TEXTO_OBLIGATORIOS) {
    const valor = body[campo];
    if (valor === undefined || valor === null || String(valor).trim() === '') {
      errores.push(`El campo "${campo}" es obligatorio`);
    } else if (typeof valor !== 'string') {
      errores.push(`El campo "${campo}" debe ser texto`);
    }
  }

  // 2. fechaHora debe ser una fecha válida
  if (typeof body.fechaHora === 'string' && body.fechaHora.trim() !== '' &&
      Number.isNaN(new Date(body.fechaHora).getTime())) {
    errores.push('El campo "fechaHora" no es una fecha válida (formato sugerido: 2026-11-26T10:30)');
  }

  // 3. precioBase obligatorio, numérico y mayor que cero
  if (body.precioBase === undefined || body.precioBase === null) {
    errores.push('El campo "precioBase" es obligatorio');
  } else if (typeof body.precioBase !== 'number' || !Number.isFinite(body.precioBase)) {
    errores.push('El campo "precioBase" debe ser un número');
  } else if (body.precioBase <= 0) {
    errores.push('El campo "precioBase" debe ser mayor que cero');
  }

  // 4. prioritario es opcional, pero si viene debe ser true/false
  if (body.prioritario !== undefined && typeof body.prioritario !== 'boolean') {
    errores.push('El campo "prioritario" debe ser true o false');
  }

  return errores;
}

// GET /api/turnos -> 200
function listarTurnos(req, res) {
  const turnos = turnosService.obtenerTodos();
  res.status(200).json(turnos);
}

// GET /api/turnos/:id -> 200 o 404
function obtenerTurno(req, res) {
  const id = Number(req.params.id);
  const turno = turnosService.obtenerPorId(id);

  if (!turno) {
    return res.status(404).json({ error: `No existe un turno con id ${req.params.id}` });
  }
  res.status(200).json(turno);
}

// POST /api/turnos -> 201 o 400
function crearTurno(req, res) {
  const errores = validarTurno(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }

  const nuevoTurno = turnosService.crear(req.body);
  res.status(201).json(nuevoTurno);
}

module.exports = { listarTurnos, obtenerTurno, crearTurno };
