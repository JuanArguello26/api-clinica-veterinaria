// services/turnosService.js
// Capa de SERVICIOS: contiene la lógica de negocio, el cálculo de la tarifa
// (regla del parámetro N) y la gestión de los datos (arreglo en memoria).

// ===================== REGLA DE NEGOCIO DEL EQUIPO =====================
// N = número de lista oficial del primer integrante del equipo
//     (integrantes ordenados alfabéticamente por apellido).
// Equipo: Argüello (#3), Guerrero (#8), Osorio (#15) -> primero: Argüello -> N = 3
const N = 3;
const PORCENTAJE_RECARGO = N * 2; // porcentajeRecargo = N × 2%
// ========================================================================

// "Base de datos" en memoria (se reinicia cada vez que se reinicia el servidor)
const turnos = [];
let siguienteId = 1;

// Calcula el valor final a pagar según la regla del equipo
function calcularTotalPagar(precioBase, prioritario) {
  if (prioritario === true) {
    // totalPagar = precioBase + (precioBase × porcentajeRecargo / 100)
    const total = precioBase + (precioBase * PORCENTAJE_RECARGO / 100);
    return Math.round(total * 100) / 100; // redondeo a 2 decimales
  }
  return precioBase; // no prioritario o no especificado
}

function obtenerTodos() {
  return turnos;
}

function obtenerPorId(id) {
  return turnos.find((turno) => turno.id === id);
}

function crear(datos) {
  const prioritario = datos.prioritario === true;

  const nuevoTurno = {
    id: siguienteId++,
    nombreCliente: datos.nombreCliente.trim(),
    nombreMascota: datos.nombreMascota.trim(),
    especie: datos.especie.trim(),
    tipoServicio: datos.tipoServicio.trim(),
    fechaHora: datos.fechaHora.trim(),
    precioBase: datos.precioBase,
    prioritario,
    porcentajeRecargo: prioritario ? PORCENTAJE_RECARGO : 0,
    totalPagar: calcularTotalPagar(datos.precioBase, prioritario),
    creadoEn: new Date().toISOString(),
  };

  turnos.push(nuevoTurno);
  return nuevoTurno;
}

module.exports = { obtenerTodos, obtenerPorId, crear, calcularTotalPagar, N, PORCENTAJE_RECARGO };
