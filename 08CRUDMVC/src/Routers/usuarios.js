const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// VALIDAR USUARIO
// ============================================================
function validarUsuario(datos) {
    const errores = [];

    if (!datos.nombre || datos.nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!datos.email) {
        errores.push('El email es obligatorio');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) {
            errores.push('Email no válido');
        }
    }

    return errores;
}

// ============================================================
// GET TODOS LOS USUARIOS
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: usuarios,
            count: usuarios.length
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================
// GET USUARIO POR ID
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [usuario] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            status: 'success',
            data: usuario[0]
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================
// CREAR USUARIO
// ============================================================
router.post('/', async (req, res) => {
    try {

        const errores = validarUsuario(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: errores.join(', ')
            });
        }

        const { nombre, email } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
            [nombre.trim(), email.trim()]
        );

        const [nuevoUsuario] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({
            status: 'success',
            data: nuevoUsuario[0]
        });

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ese email ya existe'
            });
        }

        console.error('Error al crear usuario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================
// ACTUALIZAR USUARIO
// ============================================================
router.put('/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const errores = validarUsuario(req.body);

        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: errores.join(', ')
            });
        }

        const [usuario] = await db.execute(
            'SELECT id FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        const { nombre, email } = req.body;

        await db.execute(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
            [nombre.trim(), email.trim(), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({
            status: 'success',
            data: actualizado[0]
        });

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ese email ya existe'
            });
        }

        console.error('Error al actualizar usuario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

// ============================================================
// ELIMINAR USUARIO
// ============================================================
router.delete('/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const [usuario] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        await db.execute(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({
            status: 'success',
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {

        console.error('Error al eliminar usuario:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;