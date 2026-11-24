# 🐾 API REST – Clínica Veterinaria "Full Dog"

Trabajo final – **Arquitectura Cliente/Servidor** – CIAF, Ingeniería de Software.
API REST construida con **Node.js + Express** y organizada por capas (`routes`, `controllers`, `services`).

---

## 👥 Integrantes (ordenados alfabéticamente por apellido)

| # Lista oficial | Nombre completo | Grupo |
|:---:|---|---|
| 3 | Argüello Botero Juan Esteban | Jueves |
| 8 | Guerrero Rey Brandon Jose | Miércoles |
| 15 | Osorio Morales Brayan Alexander | Miércoles |

## 🔢 Parámetro N y porcentaje de recargo

- **N = 3** → al ordenar por apellido (Argüello, Guerrero, Osorio), el primer integrante es **Argüello Botero Juan Esteban**, que ocupa el puesto **#3** en el listado oficial del grupo jueves (equipo mixto miércoles/jueves, validado con el docente).
- **porcentajeRecargo = N × 2% = 3 × 2% = 6%**

El valor se define en `services/turnosService.js` (constante `N`).

---

## 🏥 Descripción del negocio

**Full Dog** es una clínica veterinaria que ofrece servicios de salud para mascotas
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
api-clinica-veterinaria/
├── index.js                      # Inicia Express, middlewares, conecta rutas y levanta el servidor
├── routes/
│   └── turnosRoutes.js           # Solo define los endpoints y su controlador
├── controllers/
│   └── turnosController.js       # Maneja req/res, valida datos y asigna códigos HTTP
├── services/
│   └── turnosService.js          # Lógica de negocio: cálculo con N y datos en memoria
├── public/
│   └── index.html                # Cliente web (formulario + tabla) que consume la API con fetch
├── tests/
│   └── turnos.test.js            # Pruebas automatizadas (unitarias e integración con node:test)
├── pruebas.http                  # Peticiones de prueba (extensión REST Client de VS Code)
├── package.json
└── .gitignore                    # Excluye node_modules, .env y .DS_Store
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

## 🚀 Instalación y ejecución (Windows, Mac y Linux)

### 1. Instalar Node.js (una sola vez)

Descargar la versión **LTS** desde [nodejs.org](https://nodejs.org) e instalarla.
Para comprobar, abrir una terminal **nueva** y ejecutar `node -v` (debe mostrar `v18` o superior).

### 2. Descargar el proyecto

- **Sin Git:** en este repositorio, botón verde **Code → Download ZIP**, y descomprimir.
- **Con Git:**
  ```bash
  git clone https://github.com/JuanArguello26/api-clinica-veterinaria.git
  ```
  (Windows: instalar Git desde [git-scm.com](https://git-scm.com). Mac: la primera vez que se usa `git`, el sistema ofrece instalarlo).

### 3. Abrir una terminal en la carpeta del proyecto

| Sistema | Cómo |
|---|---|
| **Windows** | Abrir la carpeta en el Explorador, escribir `powershell` en la barra de direcciones y presionar Enter |
| **Mac** | Clic derecho en la carpeta → **Servicios → Nueva terminal en la carpeta** (o en Terminal: `cd ` + arrastrar la carpeta) |
| **Cualquiera** | Abrir la carpeta en VS Code → menú **Terminal → New Terminal** |

### 4. Instalar dependencias y arrancar (mismos comandos en todos los sistemas)

```bash
npm install
npm start
```

Cuando aparezca `escuchando en http://localhost:3000`, abrir **http://localhost:3000** en el navegador.
Para detener el servidor: **Ctrl + C** en la terminal (también en Mac).
`npm run dev` reinicia el servidor automáticamente al guardar cambios.

### Problemas comunes

| Problema | Windows | Mac / Linux |
|---|---|---|
| Aparece una ventana del Firewall al arrancar | Clic en **Permitir** (si se cancela, localhost sigue funcionando) | No aplica |
| `npm` no se reconoce como comando | Cerrar y abrir la terminal, o reiniciar el PC tras instalar Node | Cerrar y abrir la terminal |
| PowerShell: "la ejecución de scripts está deshabilitada" | Usar **cmd**, o ejecutar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` | No aplica |
| `Cannot find module 'express'` | Falta `npm install` | Falta `npm install` |
| `EADDRINUSE` (puerto 3000 ocupado) | `$env:PORT=3001; npm start` → abrir `localhost:3001` | `PORT=3001 npm start` → abrir `localhost:3001` |

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

- **Pruebas automatizadas:** ejecutar `npm test` en la terminal (corre las pruebas unitarias y de integración con `node:test`, validando `N = 3`, el recargo del 6 % y los códigos `200`, `201`, `400` y `404`).
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
