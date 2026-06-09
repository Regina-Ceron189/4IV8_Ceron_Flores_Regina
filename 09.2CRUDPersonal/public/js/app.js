/**
 * app.js — Lógica del frontend para "Sistema de Compras y Biblioteca"
 * Maneja navegación de pestañas, formulario de libros/reseñas y renderizado de tarjetas.
 */

// ============================================================
// 1. NAVEGACIÓN DE PESTAÑAS
// ============================================================

const navBtns = document.querySelectorAll('.nav-btn');
const tabSections = document.querySelectorAll('.tab-section');

/**
 * Activa una pestaña y oculta el resto.
 * @param {string} tabId - Identificador de la pestaña (ej. "libros")
 */
function activateTab(tabId) {
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  tabSections.forEach(section => {
    section.classList.toggle('hidden', section.id !== `tab-${tabId}`);
  });
  // Si se activa la pestaña de libros, cargamos las reseñas
  if (tabId === 'libros') {
    cargarResenas();
  }
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// ============================================================
// 2. SELECTOR DE ESTRELLAS
// ============================================================

const starBtns = document.querySelectorAll('#star-selector .star');
const calificacionInput = document.getElementById('calificacion');
const starHint = document.getElementById('star-hint');
const starLabels = ['', 'No me gustó', 'Fue pasable', 'Me gustó', 'Me encantó', '¡Obra maestra!'];

let calificacionSeleccionada = 0;

/**
 * Pinta las estrellas hasta el índice dado.
 * @param {number} valor - 0 para limpiar, 1-5 para resaltar
 */
function pintarEstrellas(valor) {
  starBtns.forEach((btn, idx) => {
    const n = idx + 1;
    btn.classList.toggle('hovered', n <= valor && valor !== calificacionSeleccionada);
    btn.classList.toggle('selected', n <= calificacionSeleccionada);
    if (valor > 0) {
      btn.classList.toggle('hovered', n <= valor);
    }
  });
}

starBtns.forEach(btn => {
  const val = parseInt(btn.dataset.value);

  btn.addEventListener('mouseenter', () => pintarEstrellas(val));
  btn.addEventListener('mouseleave', () => pintarEstrellas(calificacionSeleccionada));
  btn.addEventListener('click', () => {
    calificacionSeleccionada = val;
    calificacionInput.value = val;
    starHint.textContent = starLabels[val];
    starHint.style.color = 'var(--rosa-boton)';
    pintarEstrellas(val);
  });
});

// ============================================================
// 3. VALIDACIÓN DEL FORMULARIO
// ============================================================

/**
 * Muestra o limpia un mensaje en la interfaz del formulario.
 * @param {string} texto
 * @param {'error'|'success'|null} tipo
 */
function mostrarMensaje(texto, tipo) {
  const el = document.getElementById('form-message');
  if (!tipo) {
    el.classList.add('hidden');
    el.className = 'message hidden';
    return;
  }
  el.textContent = texto;
  el.className = `message ${tipo}`;
  el.classList.remove('hidden');
}

/**
 * Valida todos los campos del formulario.
 * @returns {{ valido: boolean, datos: object|null }}
 */
function validarFormulario() {
  const titulo       = document.getElementById('titulo').value.trim();
  const autor        = document.getElementById('autor').value.trim();
  const genero       = document.getElementById('genero').value.trim();
  const paginasStr   = document.getElementById('paginas').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin    = document.getElementById('fecha_fin').value;
  const formato      = document.getElementById('formato').value;
  const resumen      = document.getElementById('resumen').value.trim();
  const opinion      = document.getElementById('opinion').value.trim();
  const cita         = document.getElementById('cita_favorita').value.trim();
  const calificacion = parseInt(calificacionInput.value);

  // Limpiar estado de error previo
  document.querySelectorAll('.field input, .field textarea').forEach(el => el.classList.remove('invalid'));

  // Campos requeridos
  if (!titulo) {
    document.getElementById('titulo').classList.add('invalid');
    return { valido: false, mensaje: 'El título del libro es obligatorio.' };
  }
  if (!autor) {
    document.getElementById('autor').classList.add('invalid');
    return { valido: false, mensaje: 'El autor es obligatorio.' };
  }

  // Páginas
  const paginas = parseInt(paginasStr);
  if (!paginasStr || isNaN(paginas) || paginas < 1 || !Number.isInteger(paginas)) {
    document.getElementById('paginas').classList.add('invalid');
    return { valido: false, mensaje: 'Las páginas deben ser un número entero mayor a 0.' };
  }

  // Validación de fechas
  if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
    document.getElementById('fecha_fin').classList.add('invalid');
    return { valido: false, mensaje: 'La fecha de finalización no puede ser anterior a la de inicio.' };
  }

  // Calificación
  if (!calificacionInput.value || isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
    starHint.textContent = '⚠ Selecciona una calificación del 1 al 5';
    starHint.style.color = '#e57373';
    return { valido: false, mensaje: 'Debes seleccionar una calificación del 1 al 5.' };
  }

  return {
    valido: true,
    datos: {
      titulo,
      autor,
      genero:        genero || null,
      paginas,
      fecha_inicio: fecha_inicio || null,
      fecha_fin:    fecha_fin    || null,
      formato,
      resumen:       resumen || null,
      opinion:       opinion || null,
      cita_favorita: cita   || null,
      calificacion,
    }
  };
}

// ============================================================
// 4. GUARDAR RESEÑA (POST)
// ============================================================

document.getElementById('btn-guardar').addEventListener('click', async () => {
  mostrarMensaje('', null);
  const { valido, datos, mensaje } = validarFormulario();
  if (!valido) {
    mostrarMensaje(mensaje, 'error');
    return;
  }

  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando…';

  try {
    const response = await fetch('/api/mislecturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      // Intentamos leer el error del cuerpo; si viene vacío usamos el status
      const text = await response.text();
      let msg = `Error del servidor (${response.status})`;
      try { msg = JSON.parse(text).error || msg; } catch (_) {}
      throw new Error(msg);
    }

    const result = await response.json();

    mostrarMensaje('✦ Reseña guardada correctamente.', 'success');
    limpiarFormulario();
    cargarResenas();

  } catch (err) {
    console.error('[guardar reseña]', err);
    mostrarMensaje(`No se pudo guardar la reseña: ${err.message}`, 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Reseña ✦';
  }
});

// ============================================================
// 5. LIMPIAR FORMULARIO
// ============================================================

document.getElementById('btn-limpiar').addEventListener('click', () => {
  limpiarFormulario();
  mostrarMensaje('', null);
});

function limpiarFormulario() {
  ['titulo', 'autor', 'genero', 'paginas', 'fecha_inicio', 'fecha_fin',
   'resumen', 'opinion', 'cita_favorita'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('invalid');
  });
  document.getElementById('formato').value = 'Físico';
  calificacionInput.value = '';
  calificacionSeleccionada = 0;
  starHint.textContent = 'Selecciona una calificación';
  starHint.style.color = '';
  pintarEstrellas(0);
}

// ============================================================
// 6. CARGAR Y RENDERIZAR RESEÑAS (GET)
// ============================================================

async function cargarResenas() {
  const loading  = document.getElementById('loading-reviews');
  const empty    = document.getElementById('empty-reviews');
  const grid     = document.getElementById('reviews-container');
  const contador = document.getElementById('reviews-count');

  if (!loading || !empty || !grid) return;

  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  grid.classList.add('hidden');
  grid.innerHTML = '';

  try {
    const response = await fetch('/api/mislecturas');
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const libros = await response.json();

    loading.classList.add('hidden');
    contador.textContent = `${libros.length} libro${libros.length !== 1 ? 's' : ''}`;

    if (libros.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    libros.forEach(libro => {
      const card = crearTarjeta(libro);
      grid.appendChild(card);
    });

    grid.classList.remove('hidden');

  } catch (err) {
    console.error('[cargar reseñas]', err);
    loading.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.querySelector('p').textContent = 'Error al cargar las lecturas. Verifica la conexión con el servidor.';
  }
}

// ============================================================
// 7. CREAR TARJETA DE RESEÑA 
// ============================================================

const cardTemplate = document.getElementById('review-card-template');

function crearTarjeta(libro) {
  const clone = cardTemplate.content.cloneNode(true);
  const card  = clone.querySelector('.review-card');

  // Formato y Género (Modificado de .card-format/.card-genre a .tag-format/.tag-genre)
  const formatoMap = { Físico: '📖 Físico', Digital: '💻 Digital', Audio: '🎧 Audio' };
  card.querySelector('.tag-format').textContent = formatoMap[libro.formato] || libro.formato;

  const genreEl = card.querySelector('.tag-genre');
  if (libro.genero) {
    genreEl.textContent = libro.genero;
  } else {
    genreEl.remove();
  }

  // Botón eliminar (Modificado de .card-delete-btn a .btn-delete)
  card.querySelector('.btn-delete').addEventListener('click', () => {
    abrirModalEliminar(libro.id, card);
  });

  // Título y autor
  card.querySelector('.card-title').textContent = libro.titulo;
  card.querySelector('.card-author').textContent = `— ${libro.autor}`;

  // Estrellas dinámicas
  const starsEl = card.querySelector('.card-stars');
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.textContent = '★';
    star.className = i <= libro.calificacion ? 'star-on' : 'star-off';
    starsEl.appendChild(star);
  }

  // Detalles técnicos
  card.querySelector('.card-pages').textContent = libro.paginas ? `${libro.paginas} págs.` : '—';
  card.querySelector('.card-start').textContent  = formatearFecha(libro.fecha_inicio);
  card.querySelector('.card-end').textContent    = formatearFecha(libro.fecha_fin);

  // Resumen
  if (libro.resumen) {
    const blk = card.querySelector('.card-summary-block');
    blk.querySelector('.card-summary').textContent = libro.resumen;
    blk.classList.remove('hidden');
  }

  // Opinión
  if (libro.opinion) {
    const blk = card.querySelector('.card-opinion-block');
    blk.querySelector('.card-opinion').textContent = libro.opinion;
    blk.classList.remove('hidden');
  }

  // Cita Favorita (Modificado de .card-quote-block/.card-quote a .card-quote/.card-quote-text)
  if (libro.cita_favorita) {
    const blk = card.querySelector('.card-quote');
    blk.querySelector('.card-quote-text').textContent = `"${libro.cita_favorita}"`;
    blk.classList.remove('hidden');
  }

  return card;
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '—';
  const [y, m, d] = fechaStr.split('T')[0].split('-');
  const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ============================================================
// 8. ELIMINAR RESEÑA (DELETE)
// ============================================================

let idAEliminar   = null;
let cardAEliminar = null;

const modalOverlay = document.getElementById('modal-delete');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

function abrirModalEliminar(id, card) {
  idAEliminar   = id;
  cardAEliminar = card;
  modalOverlay.classList.remove('hidden');
}

modalCancel.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
  idAEliminar   = null;
  cardAEliminar = null;
});

modalConfirm.addEventListener('click', async () => {
  if (!idAEliminar) return;

  modalConfirm.disabled = true;
  modalConfirm.textContent = 'Eliminando…';

  try {
    const response = await fetch(`/api/mislecturas/${idAEliminar}`, { method: 'DELETE' });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Error ${response.status}`);
    }

    if (cardAEliminar) {
      cardAEliminar.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      cardAEliminar.style.opacity = '0';
      cardAEliminar.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cardAEliminar.remove();
        actualizarContador();
      }, 300);
    }

  } catch (err) {
    console.error('[eliminar libro]', err);
    alert(`Error al eliminar: ${err.message}`);
  } finally {
    modalConfirm.disabled = false;
    modalConfirm.textContent = 'Eliminar';
    modalOverlay.classList.add('hidden');
    idAEliminar   = null;
    cardAEliminar = null;
  }
});

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalCancel.click();
});

function actualizarContador() {
  const n = document.querySelectorAll('.review-card').length;
  document.getElementById('reviews-count').textContent = `${n} libro${n !== 1 ? 's' : ''}`;
  if (n === 0) {
    document.getElementById('reviews-container').classList.add('hidden');
    const empty = document.getElementById('empty-reviews');
    empty.classList.remove('hidden');
  }
}

// Inicialización automática de la primera carga
cargarResenas();