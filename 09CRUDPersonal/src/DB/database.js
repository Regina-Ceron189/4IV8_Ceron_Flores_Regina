const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME;

function escapeId(valor) {
    return `\`${String(valor).replace(/`/g, '``')}\``;
}

async function crearTablas(pool) {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS compras (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            producto_id INT NOT NULL,
            cantidad INT NOT NULL DEFAULT 1,
            fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_compras_usuarios
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_compras_productos
                FOREIGN KEY (producto_id) REFERENCES productos(id)
                ON DELETE RESTRICT
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS libros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            autor VARCHAR(150) NOT NULL,
            genero VARCHAR(100) NOT NULL,
            paginas INT NOT NULL,
            formato ENUM('Fisico', 'Digital', 'Audiolibro') NOT NULL,
            resumen TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS resenas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            libro_id INT NOT NULL,
            resenador VARCHAR(150) NOT NULL,
            calificacion TINYINT NOT NULL,
            comentario TEXT NOT NULL,
            fecha_lectura DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_resenas_libros
                FOREIGN KEY (libro_id) REFERENCES libros(id)
                ON DELETE CASCADE
        )
    `);
}

let pool;

const inicializacion = (async () => {
    if (!dbName) {
        throw new Error('DB_NAME no esta definido en el archivo .env');
    }

    const admin = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    await admin.execute(`CREATE DATABASE IF NOT EXISTS ${escapeId(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await admin.end();

    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    await crearTablas(pool);
    const connection = await pool.getConnection();
    connection.release();
    console.log('Conectado a MySQL correctamente');
})();

module.exports = {
    async execute(sql, params) {
        await inicializacion;
        return pool.execute(sql, params);
    },
    async getConnection() {
        await inicializacion;
        return pool.getConnection();
    }
};
