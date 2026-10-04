require('dotenv').config();

const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en el archivo .env');
}

const origen = new Database('./seguros.db', { readonly: true });

const destino = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const tablas = [
  {
    nombre: 'cliente',
    columnas: ['id_cliente', 'nombre', 'apellido', 'dni', 'email']
  },
  {
    nombre: 'cobertura',
    columnas: ['id_cobertura', 'nombre']
  },
  {
    nombre: 'poliza',
    columnas: [
      'id_poliza',
      'numero_poliza',
      'id_cliente',
      'fecha_inicio',
      'fecha_fin',
      'estado'
    ]
  },
  {
    nombre: 'siniestro',
    columnas: ['id_siniestro', 'id_poliza', 'fecha', 'tipo', 'estado']
  },
  {
    nombre: 'pago',
    columnas: ['id_pago', 'id_poliza', 'fecha', 'importe', 'estado']
  },
  {
    nombre: 'poliza_cobertura',
    columnas: ['id_poliza', 'id_cobertura']
  }
];

async function crearEstructura() {
  await destino.execute('DROP TABLE IF EXISTS poliza_cobertura');
  await destino.execute('DROP TABLE IF EXISTS pago');
  await destino.execute('DROP TABLE IF EXISTS siniestro');
  await destino.execute('DROP TABLE IF EXISTS poliza');
  await destino.execute('DROP TABLE IF EXISTS cobertura');
  await destino.execute('DROP TABLE IF EXISTS cliente');

  await destino.execute(`
    CREATE TABLE cliente (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      dni TEXT UNIQUE NOT NULL,
      email TEXT
    )
  `);

  await destino.execute(`
    CREATE TABLE poliza (
      id_poliza INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_poliza TEXT UNIQUE NOT NULL,
      id_cliente INTEGER NOT NULL,
      fecha_inicio DATE,
      fecha_fin DATE,
      estado TEXT NOT NULL,
      FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    )
  `);

  await destino.execute(`
    CREATE TABLE cobertura (
      id_cobertura INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `);

  await destino.execute(`
    CREATE TABLE siniestro (
      id_siniestro INTEGER PRIMARY KEY AUTOINCREMENT,
      id_poliza INTEGER NOT NULL,
      fecha DATE NOT NULL,
      tipo TEXT NOT NULL,
      estado TEXT NOT NULL,
      FOREIGN KEY (id_poliza) REFERENCES poliza(id_poliza)
    )
  `);

  await destino.execute(`
    CREATE TABLE pago (
      id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
      id_poliza INTEGER NOT NULL,
      fecha DATE NOT NULL,
      importe REAL NOT NULL,
      estado TEXT NOT NULL,
      FOREIGN KEY (id_poliza) REFERENCES poliza(id_poliza)
    )
  `);

  await destino.execute(`
    CREATE TABLE poliza_cobertura (
      id_poliza INTEGER NOT NULL,
      id_cobertura INTEGER NOT NULL,
      PRIMARY KEY (id_poliza, id_cobertura),
      FOREIGN KEY (id_poliza) REFERENCES poliza(id_poliza),
      FOREIGN KEY (id_cobertura) REFERENCES cobertura(id_cobertura)
    )
  `);
}

async function migrarDatos() {
  for (const tabla of tablas) {
    const filas = origen.prepare(`SELECT * FROM ${tabla.nombre}`).all();

    for (const fila of filas) {
      const signos = tabla.columnas.map(() => '?').join(', ');
      const valores = tabla.columnas.map((columna) => fila[columna]);

      await destino.execute({
        sql: `
          INSERT INTO ${tabla.nombre} (${tabla.columnas.join(', ')})
          VALUES (${signos})
        `,
        args: valores
      });
    }

    console.log(`${tabla.nombre}: ${filas.length} registros migrados`);
  }
}

async function verificarMigracion() {
  console.log('\nVerificación final:');

  for (const tabla of tablas) {
    const resultado = await destino.execute(
      `SELECT COUNT(*) AS cantidad FROM ${tabla.nombre}`
    );

    console.log(`${tabla.nombre}: ${resultado.rows[0].cantidad}`);
  }
}

async function main() {
  await crearEstructura();
  await migrarDatos();
  await verificarMigracion();

  origen.close();
}

main().catch((error) => {
  console.error('Error durante la migración:', error);
  origen.close();
});