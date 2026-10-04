const express = require('express');
const Database = require('better-sqlite3');

const app = express();

app.use(express.json());

app.use(express.static('public'));

const db = new Database('./seguros.db');

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Sistema de Seguros funcionando');
});

app.get('/clientes', (req, res) => {
    const clientes = db.prepare('SELECT * FROM cliente').all();

    res.json(clientes);
});

app.post('/clientes', (req, res) => {
    const { nombre, apellido, dni, email } = req.body;

    const resultado = db.prepare(`
        INSERT INTO cliente (nombre, apellido, dni, email)
        VALUES (?, ?, ?, ?)
    `).run(nombre, apellido, dni, email);

    res.json({
        mensaje: 'Cliente creado correctamente',
        id_cliente: resultado.lastInsertRowid
    });
});

app.put('/clientes/:id', (req, res) => {
    const { email } = req.body;
    const id = req.params.id;

    db.prepare(`
        UPDATE cliente
        SET email = ?
        WHERE id_cliente = ?
    `).run(email, id);

    res.json({
        mensaje: 'Modificación realizada con éxito'
    });
});

app.delete('/clientes/:id', (req, res) => {
    const id = req.params.id;

    const cantidadPolizas = db.prepare(`
        SELECT COUNT(*) AS cantidad
        FROM poliza
        WHERE id_cliente = ?
    `).get(id);

    if (cantidadPolizas.cantidad > 0) {
        return res.json({
            mensaje: 'El cliente tiene pólizas asociadas y no se puede eliminar'
        });
    }

    db.prepare(`
        DELETE FROM cliente
        WHERE id_cliente = ?
    `).run(id);

    res.json({
        mensaje: 'Cliente eliminado correctamente'
    });
});

app.post('/polizas', (req, res) => {
    const { numero_poliza, id_cliente, fecha_inicio, fecha_fin, estado } = req.body;

    const cliente = db.prepare(`
    SELECT COUNT(*) AS cantidad
    FROM cliente
    WHERE id_cliente = ?
`).get(id_cliente);

    if (cliente.cantidad === 0) {
        return res.json({
            mensaje: 'El cliente no existe'
        });
}

const resultado = db.prepare(`
    INSERT INTO poliza (
        numero_poliza,
        id_cliente,
        fecha_inicio,
        fecha_fin,
        estado
    )
    VALUES (?, ?, ?, ?, ?)
`).run(
    numero_poliza,
    id_cliente,
    fecha_inicio,
    fecha_fin,
    estado
);
res.json({
    mensaje: 'Póliza creada correctamente',
    id_poliza: resultado.lastInsertRowid
});

});

app.get('/polizas', (req, res) => {
    const polizas = db.prepare('SELECT * FROM poliza').all();

    res.json(polizas);
});


app.put('/polizas/:id', (req, res) => {
    const id = req.params.id;

    const { fecha_inicio, fecha_fin, estado } = req.body;

    db.prepare(`
        UPDATE poliza
        SET fecha_inicio = ?,
            fecha_fin = ?,
            estado = ?
        WHERE id_poliza = ?
    `).run(
        fecha_inicio,
        fecha_fin,
        estado,
        id
    );

    res.json({
        mensaje: 'Póliza modificada correctamente'
    });
});

app.delete('/polizas/:id', (req, res) => {
    const id = req.params.id;

    const cantidadSiniestros = db.prepare(`
        SELECT COUNT(*) AS cantidad
        FROM siniestro
        WHERE id_poliza = ?
    `).get(id);

    if (cantidadSiniestros.cantidad > 0) {
        return res.json({
            mensaje: 'No se puede eliminar la póliza, tiene siniestros asociados'
        });
    }

    db.prepare(`
        DELETE FROM poliza
        WHERE id_poliza = ?
    `).run(id);

    res.json({
        mensaje: 'Póliza eliminada correctamente'
    });
});



app.post('/siniestros', (req, res) => {

    console.log("POST SINIESTRO RECIBIDO");

    const { id_poliza, fecha, tipo, estado } = req.body;

    const poliza = db.prepare(`
        SELECT COUNT(*) AS cantidad
        FROM poliza
        WHERE id_poliza = ?
    `).get(id_poliza);

    if (poliza.cantidad === 0) {
        return res.json({
            mensaje: 'La póliza no existe'
        });
    }

    const resultado = db.prepare(`
        INSERT INTO siniestro (id_poliza, fecha, tipo, estado)
        VALUES (?, ?, ?, ?)
    `).run(id_poliza, fecha, tipo, estado);

    res.json({
        mensaje: 'Siniestro creado correctamente',
        id_siniestro: resultado.lastInsertRowid
    });
});

app.get('/siniestros', (req, res) => {
    const siniestros = db.prepare('SELECT * FROM siniestro').all();

    res.json(siniestros);
});

app.put('/siniestros/:id', (req, res) => {

    const id = req.params.id;

    const { fecha, tipo, estado } = req.body;

    db.prepare(`
        UPDATE siniestro
        SET fecha = ?,
            tipo = ?,
            estado = ?
        WHERE id_siniestro = ?
    `).run(
        fecha,
        tipo,
        estado,
        id
    );

    res.json({
        mensaje: 'Siniestro modificado correctamente'
    });
});

app.delete('/siniestros/:id', (req, res) => {
    const id = req.params.id;

    db.prepare(`
        DELETE FROM siniestro
        WHERE id_siniestro = ?
    `).run(id);

    res.json({
        mensaje: 'Siniestro eliminado correctamente'
    });
});


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});