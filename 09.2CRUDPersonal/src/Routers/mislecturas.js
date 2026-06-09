const express = require('express');
const router = express.Router();
const db = require('../DB/database.js'); 

// ============================================================
// 1. GET: Obtener todos los libros para renderizar las tarjetas
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [libros] = await db.execute(`
            SELECT id, titulo, autor, genero, paginas, 
                   fecha_inicio, fecha_fin, formato, 
                   resumen, opinion, cita_favorita, calificacion 
            FROM libros 
            ORDER BY id DESC
        `);
        res.json(libros);
    } catch (error) {
        console.error("Error al obtener lecturas:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// FUNCIÓN DE VALIDACIÓN ESTRICTA
// ============================================================
function validarResena(datos) {
    const errores = [];

    // --- SECCIÓN: DATOS DEL LIBRO ---
    
    // Validar Título (Parámetro: titulo)
    if (!datos.titulo || datos.titulo.trim() === "") {
        errores.push("[Sección: Datos del Libro] El parámetro 'Título' es obligatorio.");
    } else if (datos.titulo.length < 2 || datos.titulo.length > 255) {
        errores.push("[Sección: Datos del Libro] El 'Título' está fuera de rango (Permitido: 2 a 255 caracteres).");
    }

    // Validar Autor (Parámetro: autor)
    if (!datos.autor || datos.autor.trim() === "") {
        errores.push("[Sección: Datos del Libro] El parámetro 'Autor' es obligatorio.");
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/.test(datos.autor)) {
        errores.push("[Sección: Datos del Libro] El 'Autor' solo puede contener letras, espacios y puntos.");
    }

    // Validar Páginas (Parámetro: paginas)
    const paginasNum = Number(datos.paginas);
    if (!Number.isInteger(paginasNum)) {
        errores.push("[Sección: Datos del Libro] El parámetro 'Páginas' debe ser un valor numérico entero.");
    } else if (paginasNum < 1 || paginasNum > 10000) {
        errores.push("[Sección: Datos del Libro] El rango de 'Páginas' permitido es entre 1 y 10,000.");
    }

    // --- SECCIÓN: TU RESEÑA ---

    // Lógica condicional: Lista de Deseos vs Libro Leído
    const calif = Number(datos.calificacion);
    const esPorLeer = !calif || calif === 0;

    if (esPorLeer) {
        // REGLA: Si no hay estrellas, bloquear campos incompatibles
        if (datos.fecha_inicio || datos.fecha_fin || datos.opinion) {
            errores.push("[Sección: Tu Reseña] Conflicto de parámetros: Al no incluir calificación (Libro por leer), los parámetros 'Fecha de inicio', 'Fecha de fin' y 'Opinión' deben estar vacíos.");
        }
    } else {
        // REGLA: Si hay estrellas, deben ser válidas
        if (calif < 1 || calif > 5) {
            errores.push("[Sección: Tu Reseña] El parámetro 'Calificación' está fuera de rango (Permitido: 1 a 5 estrellas).");
        }
        // Opinión opcional, pero si existe, mínimo 10 caracteres
        if (datos.opinion && datos.opinion.trim().length > 0 && datos.opinion.trim().length < 10) {
            errores.push("[Sección: Tu Reseña] El parámetro 'Opinión' está fuera de rango (Permitido: Mínimo 10 caracteres).");
        }
    }

    // --- SECCIÓN: FECHAS ---
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Permitir fechas de hoy hasta el final del día

    if (datos.fecha_inicio && datos.fecha_inicio.trim() !== "") {
        const inicio = new Date(datos.fecha_inicio);
        if (inicio > hoy) {
            errores.push("[Sección: Datos del Libro] El parámetro 'Fecha inicio' no puede ser una fecha futura.");
        }
    }

    if (datos.fecha_fin && datos.fecha_fin.trim() !== "") {
        const fin = new Date(datos.fecha_fin);
        if (fin > hoy) {
            errores.push("[Sección: Datos del Libro] El parámetro 'Fecha fin' no puede ser una fecha futura.");
        }
        
        if (datos.fecha_inicio && datos.fecha_inicio.trim() !== "") {
            const inicio = new Date(datos.fecha_inicio);
            if (fin < inicio) {
                errores.push("[Sección: Datos del Libro] Incongruencia: 'Fecha fin' no puede ser anterior a 'Fecha inicio'.");
            }
        }
    }

    return errores;
}

// ============================================================
// 2. POST: Guardar una nueva reseña desde el formulario
// ============================================================
router.post('/', async (req, res) => {
    try {
        const datos = req.body;

        // 1. Ejecutar validaciones antes de tocar la base de datos
        const erroresValidacion = validarResena(datos);
        if (erroresValidacion.length > 0) {
            // Unimos los errores con saltos de línea para que el frontend los muestre claros
            return res.status(400).json({ error: erroresValidacion.join('\n') });
        }

        // 2. Limpieza de datos (Convertir "" a null para evitar errores en MySQL)
        const titulo = datos.titulo.trim();
        const autor = datos.autor.trim();
        const genero = datos.genero ? datos.genero.trim() : null;
        const paginas = Number(datos.paginas);
        const fecha_inicio = datos.fecha_inicio ? datos.fecha_inicio : null;
        const fecha_fin = datos.fecha_fin ? datos.fecha_fin : null;
        const formato = datos.formato;
        const resumen = datos.resumen ? datos.resumen.trim() : null;
        const opinion = datos.opinion ? datos.opinion.trim() : null;
        const cita_favorita = datos.cita_favorita ? datos.cita_favorita.trim() : null;
        const calificacion = datos.calificacion ? Number(datos.calificacion) : null;

        // 3. Inserción SQL
        const [resultado] = await db.execute(`
            INSERT INTO libros (
                titulo, autor, genero, paginas, fecha_inicio, 
                fecha_fin, formato, resumen, opinion, cita_favorita, calificacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            titulo, autor, genero, paginas, fecha_inicio, 
            fecha_fin, formato, resumen, opinion, cita_favorita, calificacion
        ]);

        const esPorLeer = !calificacion;
        const mensajeExito = esPorLeer 
            ? '✦ Añadido a tu lista de deseos.' 
            : '✦ Reseña guardada correctamente.';

        res.status(201).json({ 
            mensaje: mensajeExito, 
            id: resultado.insertId 
        });

    } catch (error) {
        console.error("Error al guardar lectura:", error);
        res.status(500).json({ error: 'Error interno de la base de datos al intentar guardar el libro.' });
    }
});

// ============================================================
// 3. DELETE: Eliminar una reseña por su ID
// ============================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM libros WHERE id = ?', [id]);
        res.json({ mensaje: 'Lectura eliminada correctamente.' });
    } catch (error) {
        console.error("Error al eliminar lectura:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;