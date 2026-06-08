// URL base de tu API en Express
const API_BASE_URL = 'http://localhost:3000';

// Cambiar de sección en las pestañas (Tabs)
function cambiarSeccion(seccionId) {
    document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    const seccionActiva = document.getElementById(`sec-${seccionId}`);
    if (seccionActiva) seccionActiva.style.display = 'block';

    const tabActiva = document.querySelector(`[data-target="sec-${seccionId}"]`);
    if (tabActiva) tabActiva.classList.add('active');

    switch (seccionId) {
        case 'usuarios': cargarUsuarios(); break;
        case 'productos': cargarProductos(); break;
        case 'compras': cargarCompras(); cargarSelectoresCompra(); break;
        case 'libros': cargarLibros(); break;
        case 'resenas': cargarResenas(); break;
    }
}

// Actualiza el cuadro superior de "ESTADO DE LA API"
function actualizarMonitorAPI(metodo, endpoint, codigo = '···') {
    const elMetodo = document.getElementById('api-metodo');
    const elUrl = document.getElementById('api-url');
    const elCodigo = document.getElementById('api-codigo');

    if (elMetodo) {
        elMetodo.textContent = metodo;
        elMetodo.className = `badge badge-${metodo.toLowerCase()}`;
    }
    if (elUrl) elUrl.textContent = endpoint;
    if (elCodigo) {
        elCodigo.textContent = codigo;
        if (codigo === '···') elCodigo.className = 'badge badge-neutral';
        else if (codigo >= 200 && codigo < 300) elCodigo.className = 'badge badge-success';
        else elCodigo.className = 'badge badge-error';
    }
}

// Sistema de Notificaciones Flotantes
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notif = document.getElementById('notificacion');
    if (!notif) return;

    notif.textContent = mensaje;
    notif.className = `notificacion ${tipo}`;
    notif.style.display = 'block';

    setTimeout(() => {
        notif.style.display = 'none';
    }, 4000);
}

// Función genérica para realizar peticiones HTTP
async function realizarPeticion(endpoint, metodo = 'GET', datos = null) {
    actualizarMonitorAPI(metodo, endpoint, '···');
    
    try {
        const opciones = { method: metodo };
        if (datos) {
            opciones.headers = { 'Content-Type': 'application/json' };
            opciones.body = JSON.stringify(datos); //  Corregido: opciones en lugar de options
        }

        const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, opciones);
        actualizarMonitorAPI(metodo, endpoint, respuesta.status);

        const contentType = respuesta.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`El servidor no devolvió un JSON válido (Status: ${respuesta.status})`);
        }

        return await respuesta.json();
    } catch (error) {
        actualizarMonitorAPI(metodo, endpoint, 'Error');
        mostrarNotificacion(error.message, 'error');
        console.error("Error en API:", error);
        throw error;
    }
}

// ==========================================
// 1. CONTROL DE USUARIOS
// ==========================================
async function cargarUsuarios() {
    try {
        let respuesta = await realizarPeticion('/api/usuarios', 'GET');
        
        let lista = respuesta;
        if (respuesta && !Array.isArray(respuesta)) {
            lista = respuesta.usuarios || respuesta.data || respuesta.rows || [];
        }
        if (!Array.isArray(lista)) lista = [];

        const tbody = document.getElementById('tbody-usuarios');
        tbody.innerHTML = '';
        
        document.getElementById('contador-usuarios').textContent = lista.length;

        lista.forEach(u => {
            const id = u.id || u.id_usuario || u.usuario_id;
            tbody.innerHTML += `
                <tr>
                    <td>${id}</td>
                    <td>${u.nombre}</td>
                    <td>${u.email}</td>
                    <td>
                        <button class="btn-tabla" onclick="editarUsuario(${id}, '${u.nombre}', '${u.email}')">Editar</button>
                        <button class="btn-tabla btn-peligro" onclick="eliminarEntidad('/api/usuarios', ${id}, cargarUsuarios)">Eliminar</button>
                    </td>
                </tr>`;
        });
        
        document.getElementById('carga-usuarios').style.display = 'none';
        document.getElementById('tabla-usuarios').style.display = 'table';
    } catch (e) {
        console.error("No se pudieron cargar los usuarios:", e);
        document.getElementById('carga-usuarios').textContent = "Error al cargar la lista de usuarios.";
    }
}

function editarUsuario(id, nombre, email) {
    document.getElementById('usuario-id').value = id;
    document.getElementById('usuario-nombre').value = nombre;
    document.getElementById('usuario-email').value = email;
    document.getElementById('form-titulo-usuario').textContent = "Editar Usuario";
    document.getElementById('btn-cancelar-usuario').style.display = 'inline-block';
}

function limpiarFormUsuario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('form-usuario').reset();
    document.getElementById('form-titulo-usuario').textContent = "Agregar Usuario";
    document.getElementById('btn-cancelar-usuario').style.display = 'none';
}

// ==========================================
// 2. CONTROL DE PRODUCTOS
// ==========================================
async function cargarProductos() {
    try {
        let respuesta = await realizarPeticion('/api/productos', 'GET');
        
        let lista = respuesta;
        if (respuesta && !Array.isArray(respuesta)) {
            lista = respuesta.productos || respuesta.data || respuesta.rows || [];
        }
        if (!Array.isArray(lista)) lista = [];

        const tbody = document.getElementById('tbody-productos');
        tbody.innerHTML = '';
        
        document.getElementById('contador-productos').textContent = lista.length;

        lista.forEach(p => {
            const id = p.id || p.id_producto || p.producto_id;
            tbody.innerHTML += `
                <tr>
                    <td>${id}</td>
                    <td>${p.nombre}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>
                        <button class="btn-tabla" onclick="editarProducto(${id}, '${p.nombre}', ${p.precio})">Editar</button>
                        <button class="btn-tabla btn-peligro" onclick="eliminarEntidad('/api/productos', ${id}, cargarProductos)">Eliminar</button>
                    </td>
                </tr>`;
        });
        document.getElementById('carga-productos').style.display = 'none';
        document.getElementById('tabla-productos').style.display = 'table';
    } catch (e) {
        document.getElementById('carga-productos').textContent = "Error al cargar productos.";
    }
}

function editarProducto(id, nombre, precio) {
    document.getElementById('producto-id').value = id;
    document.getElementById('producto-nombre').value = nombre;
    document.getElementById('producto-precio').value = precio;
    document.getElementById('form-titulo-producto').textContent = "Editar Producto";
    document.getElementById('btn-cancelar-producto').style.display = 'inline-block';
}

function limpiarFormProducto() {
    document.getElementById('producto-id').value = '';
    document.getElementById('form-producto').reset();
    document.getElementById('form-titulo-producto').textContent = "Agregar Producto";
    document.getElementById('btn-cancelar-producto').style.display = 'none';
}

// ==========================================
// 3. CONTROL DE COMPRAS
// ==========================================
async function cargarSelectoresCompra() {
    try {
        let resUsuarios = await realizarPeticion('/api/usuarios', 'GET');
        let resProductos = await realizarPeticion('/api/productos', 'GET');
        
        let usuarios = Array.isArray(resUsuarios) ? resUsuarios : (resUsuarios.usuarios || resUsuarios.data || []);
        let productos = Array.isArray(resProductos) ? resProductos : (resProductos.productos || resProductos.data || []);
        
        const selectUser = document.getElementById('compra-usuario');
        const selectProd = document.getElementById('compra-producto');
        
        selectUser.innerHTML = '<option value="">-- Seleccionar --</option>';
        selectProd.innerHTML = '<option value="">-- Seleccionar --</option>';
        
        usuarios.forEach(u => {
            const id = u.id || u.id_usuario || u.usuario_id;
            selectUser.innerHTML += `<option value="${id}">${u.nombre}</option>`;
        });
        productos.forEach(p => {
            const id = p.id || p.id_producto || p.producto_id;
            selectProd.innerHTML += `<option value="${id}">${p.nombre} ($${p.precio})</option>`;
        });
    } catch (e) {}
}

async function cargarCompras() {
    try {
        let respuesta = await realizarPeticion('/api/compras', 'GET');
        
        let lista = respuesta;
        if (respuesta && !Array.isArray(respuesta)) {
            lista = respuesta.compras || respuesta.data || respuesta.rows || [];
        }
        if (!Array.isArray(lista)) lista = [];

        const tbody = document.getElementById('tbody-compras');
        tbody.innerHTML = '';
        
        document.getElementById('contador-compras').textContent = lista.length;

        lista.forEach(c => {
            const id = c.id || c.id_compra || c.compra_id;
            const total = c.precio_unitario * c.cantidad;
            tbody.innerHTML += `
                <tr>
                    <td>${id}</td>
                    <td>${c.usuario_nombre || 'Desconocido'}</td>
                    <td>${c.producto_nombre || 'Desconocido'}</td>
                    <td>$${parseFloat(c.precio_unitario).toFixed(2)}</td>
                    <td>${c.cantidad}</td>
                    <td>$${total.toFixed(2)}</td>
                    <td>${new Date(c.fecha).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-tabla btn-peligro" onclick="eliminarEntidad('/api/compras', ${id}, cargarCompras)">Eliminar</button>
                    </td>
                </tr>`;
        });
        document.getElementById('carga-compras').style.display = 'none';
        document.getElementById('tabla-compras').style.display = 'table';
    } catch (e) {
        document.getElementById('carga-compras').textContent = "Error al cargar compras.";
    }
}

// ==========================================
// 4. CONTROL DE LIBROS Y RESEÑAS
// ==========================================
async function cargarLibros() {
    try {
        let respuesta = await realizarPeticion('/api/libros', 'GET');
        let lista = respuesta;
        if (respuesta && !Array.isArray(respuesta)) {
            lista = respuesta.libros || respuesta.data || respuesta.rows || [];
        }
        if (!Array.isArray(lista)) lista = [];

        const tbody = document.getElementById('tbody-libros');
        tbody.innerHTML = '';
        lista.forEach(l => {
            const id = l.id || l.id_libro || l.libro_id;
            tbody.innerHTML += `
                <tr>
                    <td>${id}</td>
                    <td>${l.titulo}</td>
                    <td>${l.autor}</td>
                    <td>${l.formato}</td>
                    <td>
                        <button class="btn-tabla btn-peligro" onclick="eliminarEntidad('/api/libros', ${id}, cargarLibros)">Eliminar</button>
                    </td>
                </tr>`;
        });
    } catch (e) {}
}

async function cargarResenas() {
    try {
        let respuesta = await realizarPeticion('/api/resenas', 'GET');
        let lista = respuesta;
        if (respuesta && !Array.isArray(respuesta)) {
            lista = respuesta.resenas || respuesta.data || respuesta.rows || [];
        }
        if (!Array.isArray(lista)) lista = [];

        const tbody = document.getElementById('tbody-resenas');
        tbody.innerHTML = '';
        
        lista.forEach(r => {
            const id = r.id || r.id_resena || r.resena_id;
            // Validar que la calificación sea un número válido antes de repetir las estrellas
            const estrellas = Number.isInteger(r.calificacion) && r.calificacion > 0 ? '⭐'.repeat(r.calificacion) : 'Sin nota';
            
            tbody.innerHTML += `
                <tr>
                    <td>${id}</td>
                    <td>${r.libro_id}</td>
                    <td>${r.resenador}</td>
                    <td>${estrellas}</td>
                    <td>
                        <button class="btn-tabla btn-peligro" onclick="eliminarEntidad('/api/resenas', ${id}, cargarResenas)">Eliminar</button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error("Error al renderizar la tabla de reseñas:", e);
    }
}

// Auxiliar para eliminaciones
async function eliminarEntidad(endpointBase, id, callbackRecarga) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        try {
            await realizarPeticion(`${endpointBase}/${id}`, 'DELETE');
            mostrarNotificacion('Registro eliminado con éxito.');
            callbackRecarga();
        } catch (e) {}
    }
}

// ==========================================
// INICIALIZACIÓN Y EVENTOS DE FORMULARIOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Configurar pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            const seccionId = target.replace('sec-', '');
            cambiarSeccion(seccionId);
        });
    });

    // Submit: Formulario de Usuarios
    document.getElementById('form-usuario').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const id = document.getElementById('usuario-id').value;
        const nombre = document.getElementById('usuario-nombre').value.trim();
        const email = document.getElementById('usuario-email').value.trim();

        if (!nombre || !email) {
            return mostrarNotificacion('Llena todos los campos', 'error');
        }

        const datos = { nombre, email };
        try {
            if (id) {
                await realizarPeticion(`/api/usuarios/${id}`, 'PUT', datos);
                mostrarNotificacion('Usuario actualizado con éxito');
            } else {
                await realizarPeticion('/api/usuarios', 'POST', datos);
                mostrarNotificacion('Usuario creado con éxito');
            }
            limpiarFormUsuario();
            await cargarUsuarios(); 
        } catch (error) {
            console.error("Error al procesar el formulario de usuario:", error);
        }
    });

    document.getElementById('btn-cancelar-usuario').addEventListener('click', limpiarFormUsuario);

    // Submit: Formulario de Productos
    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;
        const nombre = document.getElementById('producto-nombre').value.trim();
        const precio = document.getElementById('producto-precio').value;

        if (!nombre || !precio) return mostrarNotificacion('Llena todos los campos', 'error');

        const datos = { nombre, precio: parseFloat(precio) };
        try {
            if (id) {
                await realizarPeticion(`/api/productos/${id}`, 'PUT', datos);
                mostrarNotificacion('Producto actualizado con éxito');
            } else {
                await realizarPeticion('/api/productos', 'POST', datos);
                mostrarNotificacion('Producto creado con éxito');
            }
            limpiarFormProducto();
            await cargarProductos();
        } catch (error) {}
    });

    document.getElementById('btn-cancelar-producto').addEventListener('click', limpiarFormProducto);

    // Submit: Formulario de Compras
    document.getElementById('form-compra').addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario_id = document.getElementById('compra-usuario').value;
        const producto_id = document.getElementById('compra-producto').value;
        const cantidad = document.getElementById('compra-cantidad').value;

        if (!usuario_id || !producto_id || !cantidad) return mostrarNotificacion('Faltan campos', 'error');

        try {
            await realizarPeticion('/api/compras', 'POST', { 
                usuario_id: parseInt(usuario_id), 
                producto_id: parseInt(producto_id), 
                cantidad: parseInt(cantidad) 
            });
            mostrarNotificacion('Compra registrada exitosamente');
            document.getElementById('form-compra').reset();
            await cargarCompras();
        } catch (error) {}
    });

    // Submit: Formulario de Libros
    document.getElementById('form-libro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            titulo: document.getElementById('libro-titulo').value,
            autor: document.getElementById('libro-autor').value,
            genero: document.getElementById('libro-genero').value,
            formato: document.getElementById('libro-formato').value,
            paginas: parseInt(document.getElementById('libro-paginas').value),
            resumen: document.getElementById('libro-resumen').value
        };

        try {
            await realizarPeticion('/api/libros', 'POST', datos);
            mostrarNotificacion('Libro guardado en catálogo');
            document.getElementById('form-libro').reset();
            await cargarLibros();
        } catch (error) {}
    });

    // Submit: Formulario de Reseñas
    document.getElementById('form-resena').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const libroIdRaw = document.getElementById('resena-libro-id').value;
        const calificacionRaw = document.getElementById('resena-calificacion').value;
        const resenador = document.getElementById('resena-resenador').value.trim();
        const comentario = document.getElementById('resena-comentario').value.trim();

        if (!libroIdRaw || !calificacionRaw || !resenador) {
            return mostrarNotificacion('Por favor, selecciona un libro, una calificación y escribe tu nombre.', 'error');
        }

        const datos = {
            libro_id: parseInt(libroIdRaw),
            resenador: resenador,
            calificacion: parseInt(calificacionRaw),
            fecha: document.getElementById('resena-fecha').value || new Date().toISOString().split('T')[0],
            comentario: comentario
        };

        try {
            await realizarPeticion('/api/resenas', 'POST', datos);
            mostrarNotificacion('Reseña publicada con éxito');
            document.getElementById('form-resena').reset();
            await cargarResenas(); // Esto ahora llamará limpiamente a la función de refresco de datos
        } catch (error) {
            console.error("Error al guardar reseña:", error);
        }
    });

    // Inicializar la primera pestaña
    cambiarSeccion('usuarios');
});