// tests/turnos.test.js
// Pruebas automatizadas (unitarias y de integración) usando el runner nativo node:test.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../index');
const turnosService = require('../services/turnosService');

describe('Regla de negocio del equipo (services/turnosService.js)', () => {
  it('define N = 3 y un recargo del 6% (N × 2%)', () => {
    assert.equal(turnosService.N, 3);
    assert.equal(turnosService.PORCENTAJE_RECARGO, 6);
  });

  it('aplica el 6% de recargo cuando prioritario es true', () => {
    assert.equal(turnosService.calcularTotalPagar(80000, true), 84800);
    assert.equal(turnosService.calcularTotalPagar(120000, true), 127200);
    assert.equal(turnosService.calcularTotalPagar(33333.33, true), 35333.33);
  });

  it('mantiene el precio base cuando prioritario es false o no se envía', () => {
    assert.equal(turnosService.calcularTotalPagar(45000, false), 45000);
    assert.equal(turnosService.calcularTotalPagar(45000, undefined), 45000);
  });

  it('obtenerTodos() devuelve una copia para evitar mutar el arreglo interno', () => {
    const lista = turnosService.obtenerTodos();
    const cantidadInicial = lista.length;
    lista.push({ id: 9999, nombreCliente: 'Prueba externa' });
    assert.equal(turnosService.obtenerTodos().length, cantidadInicial);
  });
});

describe('API REST /api/turnos (integración HTTP)', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/turnos retorna 200 y un arreglo vacío al iniciar', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.deepEqual(body, []);
  });

  it('POST /api/turnos crea un turno prioritario con recargo del 6% (201)', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCliente: '  Laura Gómez  ',
        nombreMascota: 'Max',
        especie: 'Perro',
        tipoServicio: 'Consulta de urgencia',
        fechaHora: '2026-11-26T10:30',
        precioBase: 80000,
        prioritario: true,
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.id, 1);
    assert.equal(body.nombreCliente, 'Laura Gómez');
    assert.equal(body.prioritario, true);
    assert.equal(body.porcentajeRecargo, 6);
    assert.equal(body.totalPagar, 84800);
    assert.ok(body.creadoEn);
  });

  it('POST /api/turnos crea un turno normal sin recargo cuando prioritario no se envía (201)', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCliente: 'Carlos Ruiz',
        nombreMascota: 'Misha',
        especie: 'Gato',
        tipoServicio: 'Vacunación',
        fechaHora: '2026-11-27T15:00',
        precioBase: 45000,
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.id, 2);
    assert.equal(body.prioritario, false);
    assert.equal(body.porcentajeRecargo, 0);
    assert.equal(body.totalPagar, 45000);
  });

  it('GET /api/turnos lista todos los turnos registrados (200)', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.length, 2);
    assert.equal(body[0].nombreMascota, 'Max');
    assert.equal(body[1].nombreMascota, 'Misha');
  });

  it('GET /api/turnos/:id retorna el turno solicitado cuando existe (200)', async () => {
    const res = await fetch(`${baseUrl}/api/turnos/1`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.id, 1);
    assert.equal(body.nombreMascota, 'Max');
  });

  it('GET /api/turnos/:id retorna 404 cuando el id no existe', async () => {
    const res = await fetch(`${baseUrl}/api/turnos/99`);
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.match(body.error, /99/);
  });

  it('POST /api/turnos retorna 400 cuando faltan campos o hay tipos inválidos', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCliente: 'Ana Torres',
        especie: 'Perro',
        tipoServicio: 'Baño',
        fechaHora: '2026-11-28T09:00',
        precioBase: -5000,
        prioritario: 'si',
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.error, 'Datos inválidos');
    assert.equal(body.detalles.length, 3);
  });

  it('POST /api/turnos retorna 400 cuando precioBase es 0 o fechaHora es inválida', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCliente: 'Pedro Díaz',
        nombreMascota: 'Toby',
        especie: 'Perro',
        tipoServicio: 'Consulta general',
        fechaHora: 'fecha-no-valida',
        precioBase: 0,
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.detalles.length, 2);
  });

  it('POST /api/turnos retorna 400 ante JSON mal formado sin colapsar el servidor', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"nombreCliente": "Incompleto"',
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.match(body.error, /JSON válido/i);
  });

  it('retorna 404 en formato JSON para rutas inexistentes', async () => {
    const res = await fetch(`${baseUrl}/api/no-existe`);
    const body = await res.json();

    assert.equal(res.status, 404);
    assert.match(body.error, /no existe/i);
  });

  it('los registros inválidos no alteran la lista almacenada', async () => {
    const res = await fetch(`${baseUrl}/api/turnos`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.length, 2);
  });
});
