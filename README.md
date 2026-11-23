# 🐾 API REST – Clínica Veterinaria "Huellitas"

Trabajo final – **Arquitectura Cliente/Servidor** – CIAF, Ingeniería de Software.
API REST construida con **Node.js + Express** y organizada por capas (`routes`, `controllers`, `services`).

---

## 👥 Integrantes (ordenados alfabéticamente por apellido)

| # Lista oficial | Nombre completo |
|:---:|---|
| _X_ | _Apellido Apellido Nombre_ |
| _X_ | _Apellido Apellido Nombre_ |
| _X_ | _Apellido Apellido Nombre_ |

> ⚠️ Completar con los datos reales del equipo.

## 🔢 Parámetro N y porcentaje de recargo

- **N = 3** → número de lista oficial del primer integrante del equipo (en orden alfabético por apellido).
- **porcentajeRecargo = N × 2% = 3 × 2% = 6%**

El valor se define en `services/turnosService.js` (constante `N`).

---

## 🏥 Descripción del negocio

**Clínica Veterinaria Huellitas** es una clínica que ofrece servicios de salud para mascotas
(perros, gatos y otras especies): consulta general, vacunación, desparasitación, baño y peluquería,
cirugías menores y atención de urgencias.

La API permite **registrar y consultar los turnos (citas)** que los dueños solicitan para sus mascotas.
Cuando la mascota llega en estado delicado o el cliente pide ser atendido de inmediato, el turno se
marca como **prioritario**, lo que mueve a la mascota adelante en la agenda y genera un **recargo**
sobre el precio del servicio.

### Datos que requiere un turno

| Campo | Tipo | Obligatorio | Descripción |
|---|---|:---:|---|
| `nombreCliente` | texto | ✅ | Nombre del dueño de la mascota |
| `nombreMascota` | texto | ✅ | Nombre de la mascota |
| `especie` | texto | ✅ | Perro, gato, ave, etc. |
| `tipoServicio` | texto | ✅ | Consulta, vacunación, cirugía, baño… |
| `fechaHora` | texto (fecha) | ✅ | Fecha y hora de la cita, ej. `2026-11-26T10:30` |
| `precioBase` | número > 0 | ✅ | Precio del servicio en pesos (COP) |
| `prioritario` | booleano | ❌ | `true` si requiere atención prioritaria (por defecto `false`) |

Campos que **calcula el servidor**: `id`, `porcentajeRecargo`, `totalPagar`, `creadoEn`.

---

## 🧱 Arquitectura por capas

```
api-veterinaria/
├── index.js                      # Inicia Express, middlewares, conecta rutas y levanta el servidor
├── routes/
│   └── turnosRoutes.js           # Solo define los endpoints y su controlador
├── controllers/
│   └── turnosController.js       # Maneja req/res, valida datos y asigna códigos HTTP
├── services/
│   └── turnosService.js          # Lógica de negocio: cálculo con N y datos en memoria
├── public/
│   └── index.html                # Cliente web (formulario + tabla) que consume la API con fetch
├── pruebas.http                  # Peticiones de prueba (extensión REST Client de VS Code)
├── package.json
└── .gitignore                    # Excluye node_modules
```

**Flujo de una petición:**
`Cliente → index.js → routes → controller (valida) → service (calcula y guarda) → controller (responde con código HTTP) → Cliente`

| Capa | Responsabilidad |
|---|---|
| `index.js` | Crea la app, aplica `express.json()` y `express.static('public')`, monta `/api/turnos`, maneja rutas inexistentes (404) y JSON mal formado (400), y llama a `listen`. |
| `routes/` | Mapea `GET /`, `GET /:id` y `POST /` a funciones del controlador. Nada más. |
| `controllers/` | Valida el `req.body`, decide el código de estado (200, 201, 400, 404) y envía la respuesta JSON. |
| `services/` | Guarda los turnos en un arreglo en memoria, genera el `id` y aplica la regla de negocio del recargo. |

**Almacenamiento:** arreglo en memoria dentro de `services/turnosService.js` (los datos se pierden al reiniciar el servidor).

---

## 💰 Regla de negocio (capa `services/`)

```
porcentajeRecargo = N × 2          → 3 × 2 = 6 %

Si prioritario = true:
    totalPagar = precioBase + (precioBase × porcentajeRecargo / 100)
Si prioritario = false o no se envía:
    totalPagar = precioBase
```

**Ejemplos reales con N = 3 (6 %):**

| precioBase | prioritario | Cálculo | totalPagar |
|---:|:---:|---|---:|
| 80 000 | true | 80 000 + (80 000 × 6 / 100) = 80 000 + 4 800 | **84 800** |
| 45 000 | false | sin recargo | **45 000** |
| 120 000 | true | 120 000 + (120 000 × 6 / 100) = 120 000 + 7 200 | **127 200** |

---

## 🚀 Instalación y ejecución

Requisitos: Node.js 18 o superior.

```bash
git clone <URL-del-repositorio>
cd api-veterinaria
npm install
npm start
```

El servidor queda en `http://localhost:3000`.
(`npm run dev` lo reinicia automáticamente al guardar cambios.)

---

## 📡 Endpoints

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api/turnos` | Lista todos los turnos | 200 |
| GET | `/api/turnos/:id` | Consulta un turno por id | 200, 404 |
| POST | `/api/turnos` | Crea un turno y calcula el total a pagar | 201, 400 |

### ✅ Caso exitoso – `POST /api/turnos` → **201 Created**

Petición:
```json
{
  "nombreCliente": "Laura Gómez",
  "nombreMascota": "Max",
  "especie": "Perro",
  "tipoServicio": "Consulta de urgencia",
  "fechaHora": "2026-11-26T10:30",
  "precioBase": 80000,
  "prioritario": true
}
```

Respuesta obtenida (`201 Created`):
```json
{
  "id": 1,
  "nombreCliente": "Laura Gómez",
  "nombreMascota": "Max",
  "especie": "Perro",
  "tipoServicio": "Consulta de urgencia",
  "fechaHora": "2026-11-26T10:30",
  "precioBase": 80000,
  "prioritario": true,
  "porcentajeRecargo": 6,
  "totalPagar": 84800,
  "creadoEn": "2026-11-23T18:08:54.760Z"
}
```

### ❌ Error de validación – `POST /api/turnos` → **400 Bad Request**

Petición (falta `nombreMascota`, precio negativo y `prioritario` no es booleano):
```json
{
  "nombreCliente": "Ana Torres",
  "especie": "Perro",
  "tipoServicio": "Baño",
  "fechaHora": "2026-11-28T09:00",
  "precioBase": -5000,
  "prioritario": "si"
}
```

Respuesta obtenida (`400 Bad Request`):
```json
{
  "error": "Datos inválidos",
  "detalles": [
    "El campo \"nombreMascota\" es obligatorio",
    "El campo \"precioBase\" debe ser mayor que cero",
    "El campo \"prioritario\" debe ser true o false"
  ]
}
```

### 🔍 Consulta de id inexistente – `GET /api/turnos/99` → **404 Not Found**

```json
{ "error": "No existe un turno con id 99" }
```

### 📋 Listado – `GET /api/turnos` → **200 OK**

Devuelve un arreglo con todos los turnos registrados (`[]` si aún no hay ninguno).

---

## 🧪 Cómo probar

- **Cliente web:** abrir `http://localhost:3000` en el navegador. Desde ahí se pueden crear turnos (201 / 400), listar todos (200) y buscar por id (200 / 404). La página solo consume la API con `fetch`; toda la lógica sigue en el servidor.
- **VS Code + REST Client:** abrir `pruebas.http` y pulsar *Send Request* sobre cada petición.
- **Postman / Thunder Client:** usar los JSON de arriba con `Content-Type: application/json`.
- **curl:**

```bash
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{"nombreCliente":"Laura Gómez","nombreMascota":"Max","especie":"Perro","tipoServicio":"Consulta de urgencia","fechaHora":"2026-11-26T10:30","precioBase":80000,"prioritario":true}'

curl http://localhost:3000/api/turnos
curl http://localhost:3000/api/turnos/1
curl http://localhost:3000/api/turnos/99
```
