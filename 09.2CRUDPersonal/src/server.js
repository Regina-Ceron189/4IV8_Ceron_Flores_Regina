const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const misLecturas = require('./Routers/mislecturas');
const favoritos = require('./Routers/favoritos');
const estadisticas = require('./Routers/estadisticas');
const porLeer = require('./Routers/porleer');

const app = express();

app.use(cors());
app.use(express.json());

// API primero
app.use('/api/mislecturas', misLecturas);
app.use('/api/favoritos', favoritos);
app.use('/api/estadisticas', estadisticas);
app.use('/api/porleer', porLeer);

// Static al final
app.use(express.static(
    path.join(__dirname, 'public')
));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Servidor iniciado en http://localhost:${PORT}`
    );
});