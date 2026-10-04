require('dotenv').config();

const express = require('express');
const { createClient } = require('@libsql/client');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

app.get('/clientes', async (req, res) => {
  const resultado = await db.execute('SELECT * FROM cliente');
  res.json(resultado.rows);
});

app.post('/clientes', async (req, res) => {
  const { nombre, apellido, dni, email } = req.body;

  const resultado = await db.execute({
    sql: `
      INSERT INTO cliente (nombre, apellido, dni, email)
      VALUES (?, ?, ?, ?)
    `,
    args: [nombre, apellido, dni, email]
  });

  res.json({
    mensaje: 'Cliente creado correctamente',
    id_cliente: resultado.lastInsertRowid
  });
});

app.put('/clientes/:id', async (req, res) => {
  const { email } = req.body;

  await db.execute({
    sql: 'UPDATE cliente SET email = ? WHERE id_cliente = ?',
    args: [email, req.params.id]
  });

  res.json({ mensaje: 'Modificación realizada con éxito' });
});

app.delete('/clientes/:id', async (req, res) => {
  const resultado = await db.execute({
    sql: 'SELECT COUNT(*) AS cantidad FROM poliza WHERE id_cliente = ?',
    args: [req.params.id]
  });

  if (Number(resultado.rows[0].cantidad) > 0) {
    return res.json({
      mensaje: 'El cliente tiene pólizas asociadas y no se puede eliminar'
    });
  }

  await db.execute({
    sql: 'DELETE FROM cliente WHERE id_cliente = ?',
    args: [req.params.id]
  });

  res.json({ mensaje: 'Cliente eliminado correctamente' });
});

app.get('/polizas', async (req, res) => {
  const resultado = await db.execute('SELECT * FROM poliza');
  res.json(resultado.rows);
});

app.post('/polizas', async (req, res) => {
  const { numero_poliza, id_cliente, fecha_inicio, fecha_fin, estado } = req.body;

  const cliente = await db.execute({
    sql: 'SELECT COUNT(*) AS cantidad FROM cliente WHERE id_cliente = ?',
    args: [id_cliente]
  });

  if (Number(cliente.rows[0].cantidad) === 0) {
    return res.json({ mensaje: 'El cliente no existe' });
  }

  const resultado = await db.execute({
    sql: `
      INSERT INTO poliza (
        numero_poliza,
        id_cliente,
        fecha_inicio,
        fecha_fin,
        estado
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [numero_poliza, id_cliente, fecha_inicio, fecha_fin, estado]
  });

  res.json({
    mensaje: 'Póliza creada correctamente',
    id_poliza: resultado.lastInsertRowid
  });
});

app.put('/polizas/:id', async (req, res) => {
  const { fecha_inicio, fecha_fin, estado } = req.body;

  await db.execute({
    sql: `
      UPDATE poliza
      SET fecha_inicio = ?, fecha_fin = ?, estado = ?
      WHERE id_poliza = ?
    `,
    args: [fecha_inicio, fecha_fin, estado, req.params.id]
  });

  res.json({ mensaje: 'Póliza modificada correctamente' });
});

app.delete('/polizas/:id', async (req, res) => {
  const resultado = await db.execute({
    sql: 'SELECT COUNT(*) AS cantidad FROM siniestro WHERE id_poliza = ?',
    args: [req.params.id]
  });

  if (Number(resultado.rows[0].cantidad) > 0) {
    return res.json({
      mensaje: 'No se puede eliminar la póliza, tiene siniestros asociados'
    });
  }

  await db.execute({
    sql: 'DELETE FROM poliza WHERE id_poliza = ?',
    args: [req.params.id]
  });

  res.json({ mensaje: 'Póliza eliminada correctamente' });
});

app.get('/siniestros', async (req, res) => {
  const resultado = await db.execute('SELECT * FROM siniestro');
  res.json(resultado.rows);
});

app.post('/siniestros', async (req, res) => {
  const { id_poliza, fecha, tipo, estado } = req.body;

  const poliza = await db.execute({
    sql: 'SELECT COUNT(*) AS cantidad FROM poliza WHERE id_poliza = ?',
    args: [id_poliza]
  });

  if (Number(poliza.rows[0].cantidad) === 0) {
    return res.json({ mensaje: 'La póliza no existe' });
  }

  const resultado = await db.execute({
    sql: `
      INSERT INTO siniestro (id_poliza, fecha, tipo, estado)
      VALUES (?, ?, ?, ?)
    `,
    args: [id_poliza, fecha, tipo, estado]
  });

  res.json({
    mensaje: 'Siniestro creado correctamente',
    id_siniestro: resultado.lastInsertRowid
  });
});

app.put('/siniestros/:id', async (req, res) => {
  const { fecha, tipo, estado } = req.body;

  await db.execute({
    sql: `
      UPDATE siniestro
      SET fecha = ?, tipo = ?, estado = ?
      WHERE id_siniestro = ?
    `,
    args: [fecha, tipo, estado, req.params.id]
  });

  res.json({ mensaje: 'Siniestro modificado correctamente' });
});

app.delete('/siniestros/:id', async (req, res) => {
  await db.execute({
    sql: 'DELETE FROM siniestro WHERE id_siniestro = ?',
    args: [req.params.id]
  });

  res.json({ mensaje: 'Siniestro eliminado correctamente' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(400).json({
    mensaje: 'No se pudo realizar la operación'
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Servidor con Turso funcionando en http://localhost:3000');
  });
}

module.exports = app;