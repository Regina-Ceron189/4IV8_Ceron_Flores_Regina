const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const app = express();
// servidor para inicializar con express

const PORT = process.env.PORT || 3000;

// para poder aplicar el MVC necesitamos un intermediario que se va a encargar de ser un mesero (middleware), 
// el cual para cada peticion que pasa por la ruta de la vista, obtiene una peticiÃ³n y la envia a un controlador
app.use(cors());

// las peticiones las debemos de atender en un formato JSON, lo que permite poder detectar los elementos bajo los criterios clave, valor
app.use(express.json());

// que se debe de tener una ruta personalizada por cada tipo de peticiÃ³n next es la ruta a la cual se va atender el tipo de petiÃ³n o de respuesta
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// debemos definir las rutas para los archivos
app.use(express.static(path.join(__dirname, 'public')));

// ImportaciÃ³n de los enrutadores
const usuariosRouter = require('./src/Routers/usuarios');
const productosRouter = require('./src/Routers/productos');
const comprasRouter = require('./src/Routers/compras');
const librosRouter = require('./src/Routers/libros');
const resenasRouter = require('./src/Routers/resenas'); // Corregido: nombre de la variable

// AsignaciÃ³n de rutas a sus respectivos controladores
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/libros', librosRouter);   // Corregido: apuntaba a usuariosRouter
app.use('/api/resenas', resenasRouter); // Corregido: apuntaba a productosRouter y se omitiÃ³ la 'Ã±'


// vamos a documentar cada endpoint
app.get('/api', (req, res) => {
    res.json({
        status : 'success',
        message : 'API REST - CRUD Personal',
        endpoint : {
            usuarios : {
                listar : 'GET /api/usuarios',
                obtener : 'GET /api/usuarios/:id',
                crear : 'POST /api/usuarios',
                actualizar : 'PUT /api/usuarios/:id',
                eliminar : 'DELETE /api/usuarios/:id'
            },
            productos : {
                listar : 'GET /api/productos',
                obtener : 'GET /api/productos/:id',
                crear : 'POST /api/productos',
                actualizar : 'PUT /api/productos/:id',
                eliminar : 'DELETE /api/productos/:id'
            },
            compras : {
                listar : 'GET /api/compras',
                obtener : 'GET /api/compras/:id',
                crear : 'POST /api/compras',
                actualizar : 'PUT /api/compras/:id',
                eliminar : 'DELETE /api/compras/:id'
            },
            libros : { // Corregido: apuntaban a compras
                listar : 'GET /api/libros',
                obtener : 'GET /api/libros/:id',
                crear : 'POST /api/libros',
                actualizar : 'PUT /api/libros/:id',
                eliminar : 'DELETE /api/libros/:id'
            },
            resenas : { // Corregido: apuntaban a compras
                listar : 'GET /api/resenas',
                obtener : 'GET /api/resenas/:id',
                crear : 'POST /api/resenas',
                actualizar : 'PUT /api/resenas/:id',
                eliminar : 'DELETE /api/resenas/:id'
            }
        }
    });
});

// vamos a crear una funcion para las rutas inexistentes de la API
app.use('/api', (req, res) => {
    // Corregido: Se eliminÃ³ res.send() adicional para evitar colisiÃ³n de respuestas
    res.status(404).json({
        status : 'error',
        message : 'Ruta no encontrada en la API'
    });
});

// necesitamos un manejador de errores global
app.use((err, req, res, next) =>{
    console.log('Error no manejado: ', err.message);
    res.status(500).json({
        status : 'error',
        message : 'Error interno del servidor'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor inicializado en el puerto ${PORT}`);
});
