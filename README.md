# Sistema Web de Seguros de Accidentes Personales

## Descripción

Sistema web de seguros de accidentes personales, diseñado para agilizar la carga y gestión de clientes, pólizas y siniestros. Incluye un Dashboard que brinda una visión general de la cantidad de clientes, las pólizas activas y los siniestros según su estado.

## Funcionalidades principales

- Gestionar clientes, pólizas y siniestros mediante operaciones de alta, modificación, consulta y eliminación.
- Validar que no existan DNI ni números de póliza duplicados.
- Visualizar los datos registrados en tablas ordenadas.
- Consultar los estados de las pólizas y los siniestros.
- Analizar la información mediante un Dashboard con indicadores y tres gráficos.

## Tecnologías utilizadas

- **SQLite:** motor de base de datos local.
- **Node.js:** entorno que ejecuta el backend.
- **Express:** framework utilizado para crear la API.
- **better-sqlite3:** librería que conecta Node.js con SQLite.
- **HTML, CSS y JavaScript:** tecnologías utilizadas para desarrollar el frontend.
- **Chart.js:** librería utilizada para crear los tres gráficos.
- **Visual Studio Code:** editor utilizado para desarrollar el proyecto.
- **Git y GitHub:** herramientas de control de versiones y repositorio.
- **Turso/libSQL:** base de datos compatible con SQLite utilizada para la versión publicada.
- **Vercel:** plataforma utilizada para publicar el frontend y el backend.

## Ejecución local

1. Instalar las dependencias del proyecto:

```powershell
npm.cmd install
```

2. Iniciar el backend local con SQLite:

```powershell
node server.js
```

3. Abrir el navegador en:

```text
http://localhost:3000
```

Con estos pasos, el sistema se ejecuta localmente de forma completa.

## Aplicación publicada

La aplicación se encuentra publicada en Vercel y puede consultarse en la siguiente URL:

https://sistema-seguros-accidentes-personal.vercel.app/

## Base de datos

SQLite fue el motor utilizado para la base de datos local. La base cuenta con seis tablas: cliente, póliza, cobertura, siniestro, pago y póliza_cobertura; las entidades principales del sistema son clientes, pólizas y siniestros.

Turso/libSQL permite mantener los datos persistentes en la versión publicada, mientras que Vercel publica el frontend y el backend en línea.