const express = require('express');
const router = express.Router();
const db = require('../DB/database.js'); // Manteniendo consistencia en las rutas

router.get('/', async (req, res) => {
    try {
        const [[libros]] = await db.execute(`
            SELECT COUNT(*) total FROM libros
        `);

        const [[paginas]] = await db.execute(`
            SELECT SUM(paginas) total FROM libros
        `);

        const [[promedio]] = await db.execute(`
            SELECT ROUND(AVG(calificacion),1) promedio FROM libros
        `);

        const [[genero]] = await db.execute(`
            SELECT genero, COUNT(*) cantidad
            FROM libros
            WHERE genero IS NOT NULL AND genero != ''
            GROUP BY genero
            ORDER BY cantidad DESC
            LIMIT 1
        `);

        res.json({
            totalLibros: libros.total,
            totalPaginas: paginas.total || 0,
            promedioCalificacion: promedio.promedio || 0,
            generoFavorito: genero?.genero || 'Sin datos'
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;