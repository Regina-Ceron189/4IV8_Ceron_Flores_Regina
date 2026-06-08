const express = require('express');
const router = express.Router();
const db = require('../DB/database');

router.get('/', async (req, res) => {
    try {

        const [rows] = await db.execute(`
            SELECT
                l.id,
                l.titulo,
                l.autor,
                l.genero,
                l.paginas,
                l.formato,
                l.fecha_inicio,
                l.fecha_fin,
                r.resumen,
                r.opinion,
                r.cita_favorita,
                r.calificacion
            FROM libros l
            LEFT JOIN resenas r
                ON l.id = r.libro_id
            ORDER BY l.id DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error al obtener lecturas'
        });
    }
});

router.post('/', async (req, res) => {

    const {
        titulo,
        autor,
        genero,
        paginas,
        formato,
        fecha_inicio,
        fecha_fin,
        resumen,
        opinion,
        cita_favorita,
        calificacion
    } = req.body;

    // getConnection() está dentro del try para que cualquier fallo
    // quede capturado y devuelva JSON en lugar de dejar la respuesta vacía
    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [libro] = await connection.execute(`
            INSERT INTO libros
            (
                titulo,
                autor,
                genero,
                paginas,
                formato,
                fecha_inicio,
                fecha_fin
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            titulo,
            autor,
            genero,
            paginas,
            formato,
            fecha_inicio,
            fecha_fin
        ]);

        await connection.execute(`
            INSERT INTO resenas
            (
                libro_id,
                resumen,
                opinion,
                cita_favorita,
                calificacion
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            libro.insertId,
            resumen,
            opinion,
            cita_favorita,
            calificacion
        ]);

        await connection.commit();

        res.status(201).json({
            mensaje: 'Lectura guardada'
        });

    } catch (error) {

        if (connection) await connection.rollback();

        console.error('[POST /mislecturas]', error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        if (connection) connection.release();

    }
});

router.delete('/:id', async (req, res) => {

    try {

        await db.execute(
            'DELETE FROM libros WHERE id = ?',
            [req.params.id]
        );

        res.json({
            mensaje: 'Libro eliminado'
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
});

module.exports = router;
