const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarLibro(datos) {
    const errores = [];
    const formatos = ['Fisico', 'Digital', 'Audiolibro'];

    if (!datos.titulo || typeof datos.titulo !== 'string' || datos.titulo.trim().length < 2) {
        errores.push('El titulo es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!datos.autor || typeof datos.autor !== 'string' || datos.autor.trim().length < 2) {
        errores.push('El autor es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!datos.genero || typeof datos.genero !== 'string' || datos.genero.trim().length < 2) {
        errores.push('El genero es obligatorio');
    }

    const paginas = Number(datos.paginas);
    if (!Number.isInteger(paginas) || paginas <= 0) {
        errores.push('Las paginas deben ser un numero entero mayor que 0');
    }

    if (!datos.formato || !formatos.includes(datos.formato)) {
        errores.push('El formato debe ser Fisico, Digital o Audiolibro');
    }

    if (!datos.resumen || typeof datos.resumen !== 'string' || datos.resumen.trim().length < 10) {
        errores.push('El resumen debe tener al menos 10 caracteres');
    }

    return errores;
}

router.get('/', async (req, res) => {
    try {
        const [libros] = await db.execute(`
            SELECT
                l.id,
                l.titulo,
                l.autor,
                l.genero,
                l.paginas,
                l.formato,
                l.resumen,
                l.created_at,
                l.updated_at,
                COALESCE(r.total_resenas, 0) AS total_resenas,
                r.promedio_calificacion
            FROM libros l
            LEFT JOIN (
                SELECT
                    libro_id,
                    COUNT(id) AS total_resenas,
                    ROUND(AVG(calificacion), 1) AS promedio_calificacion
                FROM resenas
                GROUP BY libro_id
            ) r ON r.libro_id = l.id
            ORDER BY l.id ASC
        `);

        res.json({ status: 'success', data: libros, count: libros.length });
    } catch (error) {
        console.error('Error al listar libros:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [libros] = await db.execute(`
            SELECT
                l.id,
                l.titulo,
                l.autor,
                l.genero,
                l.paginas,
                l.formato,
                l.resumen,
                l.created_at,
                l.updated_at,
                COALESCE(r.total_resenas, 0) AS total_resenas,
                r.promedio_calificacion
            FROM libros l
            LEFT JOIN (
                SELECT
                    libro_id,
                    COUNT(id) AS total_resenas,
                    ROUND(AVG(calificacion), 1) AS promedio_calificacion
                FROM resenas
                GROUP BY libro_id
            ) r ON r.libro_id = l.id
            WHERE l.id = ?
        `, [req.params.id]);

        if (libros.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.params.id} no encontrado` });
        }

        res.json({ status: 'success', data: libros[0] });
    } catch (error) {
        console.error('Error al obtener libro:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const errores = validarLibro(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { titulo, autor, genero, paginas, formato, resumen } = req.body;
        const [resultado] = await db.execute(
            'INSERT INTO libros (titulo, autor, genero, paginas, formato, resumen) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo.trim(), autor.trim(), genero.trim(), Number(paginas), formato, resumen.trim()]
        );

        const [nuevo] = await db.execute('SELECT * FROM libros WHERE id = ?', [resultado.insertId]);
        res.status(201).json({ status: 'success', data: nuevo[0] });
    } catch (error) {
        console.error('Error al crear libro:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const [existente] = await db.execute('SELECT id FROM libros WHERE id = ?', [req.params.id]);
        if (existente.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.params.id} no encontrado` });
        }

        const errores = validarLibro(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { titulo, autor, genero, paginas, formato, resumen } = req.body;
        await db.execute(
            'UPDATE libros SET titulo = ?, autor = ?, genero = ?, paginas = ?, formato = ?, resumen = ? WHERE id = ?',
            [titulo.trim(), autor.trim(), genero.trim(), Number(paginas), formato, resumen.trim(), req.params.id]
        );

        const [actualizado] = await db.execute('SELECT * FROM libros WHERE id = ?', [req.params.id]);
        res.json({ status: 'success', data: actualizado[0] });
    } catch (error) {
        console.error('Error al actualizar libro:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [libro] = await db.execute('SELECT id, titulo FROM libros WHERE id = ?', [req.params.id]);
        if (libro.length === 0) {
            return res.status(404).json({ status: 'error', message: `Libro con ID ${req.params.id} no encontrado` });
        }

        await db.execute('DELETE FROM resenas WHERE libro_id = ?', [req.params.id]);
        await db.execute('DELETE FROM libros WHERE id = ?', [req.params.id]);
        res.json({
            status: 'success',
            data: {
                eliminado: libro[0],
                mensaje: `Libro "${libro[0].titulo}" y sus resenas eliminados`
            }
        });
    } catch (error) {
        console.error('Error al eliminar libro:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;