const express = require('express');
const router = express.Router();
const db = require('../DB/database.js');

router.get('/', async (req, res) => {
    try {
        // Buscamos directamente en 'libros' los que tengan calificación perfecta (5 estrellas)
        const [rows] = await db.execute(`
            SELECT * FROM libros 
            WHERE calificacion = 5 
            ORDER BY id DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;