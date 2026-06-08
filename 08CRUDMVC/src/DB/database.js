const mysql = require('mysql2');

// creamos la conexion
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// PRUEBA DE CONEXIÓN
pool.getConnection((err, connection) => {
    if (err) {
        console.error('ERROR MYSQL:', err);
    } else {
        console.log('Conectado a MySQL correctamente');
        connection.release();
    }
});

// la exportamos para poder usarla
module.exports = pool.promise();