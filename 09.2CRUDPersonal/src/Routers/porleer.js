const express = require('express');
const router = express.Router();
const db = require('../DB/database.js');

router.get('/', async (req, res) => {
    try {
        // Consideramos "por leer" aquellos libros que no tienen calificación asignada aún
        const [librosPorLeer] = await db.execute(`
            SELECT * FROM libros 
            WHERE calificacion IS NULL OR calificacion = 0
            ORDER BY id DESC
        `);

        res.json(librosPorLeer);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;