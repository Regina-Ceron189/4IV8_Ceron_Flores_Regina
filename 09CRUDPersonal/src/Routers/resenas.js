const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarResena(datos) {
    const errores = [];

    if (!datos.libro_id || !Number.isInteger(Number(datos.libro_id)) || Number(datos.libro_id) <= 0) {
        errores.push('Selecciona un libro valido');
    }

    if (!datos.resenador || typeof datos.resenador !== 'string' || datos.resenador.trim().length < 2) {
        errores.push('El nombre del resenador es obligatorio');
    }

    const calificacion = Number(datos.calificacion);
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
        errores.push('La calificacion debe estar entre 1 y 5');
    }

    if (!datos.comentario || typeof datos.comentario !== 'string' || datos.comentario.trim().length < 10) {
        errores.push('El comentario debe tener al menos 10 caracteres');
    }

    return errores;
}

async function obtenerResena(id) {
    const [resenas] = await db.execute(`
        SELECT
            r.id,
            r.libro_id,
            l.titulo AS libro_titulo,
            l.autor AS libro_autor,
            r.resenador,
            r.calificacion,
            r.comentario,
            r.fecha_lectura,
            r.created_at
        FROM resenas r
        INNER JOIN libros l ON r.libro_id = l.id
        WHERE r.id = ?
    `, [id]);

    return resenas[0];
}

router.get('/', async (req, res) => {
    try {
        const [resenas] = await db.execute(`
            SELECT
                r.id,
                r.libro_id,
                l.titulo AS libro_titulo,
                l.autor AS libro_autor,
                r.resenador,
                r.calificacion,
                r.comentario,
                r.fecha_lectura,
                r.created_at
            FROM resenas r
            INNER JOIN libros l ON r.libro_id = l.id
            ORDER BY r.created_at DESC
        `);

        res.json({ status: 'success', data: resenas, count: resenas.length });
    } catch (error) {
        console.error('Error al listar resenas:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/libro/:libro_id', async (req, res) => {
    try {
        const [libro] = await db.execute('SELECT id, titulo, autor FROM libros WHERE id = ?', [req.params.libro_id]);
        if (libro.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.params.libro_id} no encontrado` });
        }

        const [resenas] = await db.execute(`
            SELECT id, resenador, calificacion, comentario, fecha_lectura, created_at
            FROM resenas
            WHERE libro_id = ?
            ORDER BY created_at DESC
        `, [req.params.libro_id]);

        const promedio = resenas.length
            ? (resenas.reduce((sum, r) => sum + Number(r.calificacion), 0) / resenas.length).toFixed(1)
            : null;

        res.json({
            status: 'success',
            data: {
                libro: libro[0],
                resenas,
                total_resenas: resenas.length,
                promedio_calificacion: promedio
            }
        });
    } catch (error) {
        console.error('Error al obtener resenas del libro:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const resena = await obtenerResena(req.params.id);
        if (!resena) {
            return res.status(404).json({ status: 'error', message: `Resena con ID ${req.params.id} no encontrada` });
        }

        res.json({ status: 'success', data: resena });
    } catch (error) {
        console.error('Error al obtener resena:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const errores = validarResena(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const [libro] = await db.execute('SELECT id FROM libros WHERE id = ?', [req.body.libro_id]);
        if (libro.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.body.libro_id} no encontrado` });
        }

        const fechaLectura = req.body.fecha_lectura || null;
        const [resultado] = await db.execute(
            'INSERT INTO resenas (libro_id, resenador, calificacion, comentario, fecha_lectura) VALUES (?, ?, ?, ?, ?)',
            [Number(req.body.libro_id), req.body.resenador.trim(), Number(req.body.calificacion), req.body.comentario.trim(), fechaLectura]
        );

        const nueva = await obtenerResena(resultado.insertId);
        res.status(201).json({ status: 'success', data: nueva });
    } catch (error) {
        console.error('Error al crear resena:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const existente = await obtenerResena(req.params.id);
        if (!existente) {
            return res.status(404).json({ status: 'error', message: `Resena con ID ${req.params.id} no encontrada` });
        }

        const errores = validarResena(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const [libro] = await db.execute('SELECT id FROM libros WHERE id = ?', [req.body.libro_id]);
        if (libro.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.body.libro_id} no encontrado` });
        }

        const fechaLectura = req.body.fecha_lectura || null;
        await db.execute(
            'UPDATE resenas SET libro_id = ?, resenador = ?, calificacion = ?, comentario = ?, fecha_lectura = ? WHERE id = ?',
            [Number(req.body.libro_id), req.body.resenador.trim(), Number(req.body.calificacion), req.body.comentario.trim(), fechaLectura, req.params.id]
        );

        const actualizada = await obtenerResena(req.params.id);
        res.json({ status: 'success', data: actualizada });
    } catch (error) {
        console.error('Error al actualizar resena:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const existente = await obtenerResena(req.params.id);
        if (!existente) {
            return res.status(404).json({ status: 'error', message: `Resena con ID ${req.params.id} no encontrada` });
        }

        await db.execute('DELETE FROM resenas WHERE id = ?', [req.params.id]);
        res.json({
            status: 'success',
            data: {
                eliminado: existente,
                mensaje: `Resena de "${existente.libro_titulo}" eliminada`
            }
        });
    } catch (error) {
        console.error('Error al eliminar resena:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;