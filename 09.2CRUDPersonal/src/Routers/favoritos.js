const express = require('express');
const router = express.Router();
const db = require('../DB/database');

router.get('/', async (req, res) => {

    try {

        const [rows] = await db.execute(`
            SELECT
                l.*,
                r.calificacion
            FROM libros l
            INNER JOIN resenas r
                ON l.id = r.libro_id
            WHERE r.calificacion = 5
        `);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;