const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

    res.json({
        mensaje: 'Sección por leer pendiente'
    });

});

module.exports = router;