/**
 * app.js — Lógica del frontend para "Sistema de Compras y Biblioteca"
 * Maneja navegación de pestañas, formulario de libros/reseñas y renderizado de tarjetas.
 */

// ============================================================
// 1. NAVEGACIÓN DE PESTAÑAS Y CARGA DINÁMICA
// ============================================================

const navBtns = document.querySelectorAll('.nav-btn');
const tabSections = document.querySelectorAll('.tab-section');

/**
 * Activa una pestaña, oculta el resto y dispara la consulta a la API correspondiente.
 * @param {string} tabId - Identificador de la pestaña
 */
function activateTab(tabId) {
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  tabSections.forEach(section => {
    section.classList.toggle('hidden', section.id !== `tab-${tabId}`);
  });

  // Enrutamiento de peticiones según la pestaña activa
  if (tabId === 'libros') {
    cargarResenas();
  } else if (tabId === 'por-leer') {
    cargarPorLeer();
  } else if (tabId === 'favoritos') {
    cargarFavoritos();
  } else if (tabId === 'estadisticas') {
    cargarEstadisticas();
  }
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// ============================================================
// 2. SELECTOR DE ESTRELLAS (ACTUALIZADO PARA "POR LEER")
// ============================================================

const starBtns = document.querySelectorAll('#star-selector .star');
const calificacionInput = document.getElementById('calificacion');
const starHint = document.getElementById('star-hint');
const starLabels = ['Sin calificar', 'No me gustó', 'Fue pasable', 'Me gustó', 'Me encantó', '¡Obra maestra!'];

let calificacionSeleccionada = 0;

function pintarEstrellas(valor) {
  starBtns.forEach((btn, idx) => {
    const n = idx + 1;
    btn.classList.toggle('selected', n <= valor);
    btn.classList.toggle('hovered', false);
  });
}

starBtns.forEach(btn => {
  const val = parseInt(btn.dataset.value);

  btn.addEventListener('mouseenter', () => {
    starBtns.forEach((b, i) => b.classList.toggle('hovered', (i + 1) <= val));
  });

  btn.addEventListener('mouseleave', () => {
    starBtns.forEach(b => b.classList.remove('hovered'));
  });

  btn.addEventListener('click', () => {
    if (calificacionSeleccionada === val) {
      calificacionSeleccionada = 0;
      calificacionInput.value = '';
      starHint.textContent = starLabels[0];
    } else {
      calificacionSeleccionada = val;
      calificacionInput.value = val;
      starHint.textContent = starLabels[val];
    }
    
    starHint.style.color = calificacionSeleccionada === 0 ? '' : 'var(--rosa-boton)';
    pintarEstrellas(calificacionSeleccionada);
  });
});

// ============================================================
// 3. VALIDACIÓN DEL FORMULARIO (CON RESTRICCIÓN "POR LEER")
// ============================================================

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

function validarFormulario() {
  const titulo       = document.getElementById('titulo').value.trim();
  const autor        = document.getElementById('autor').value.trim();
  const genero       = document.getElementById('genero').value; // Ahora es un select
  const paginasStr   = document.getElementById('paginas').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin    = document.getElementById('fecha_fin').value;
  const formato      = document.getElementById('formato').value;
  const resumen      = document.getElementById('resumen').value.trim();
  const opinion      = document.getElementById('opinion').value.trim();
  const cita         = document.getElementById('cita_favorita').value.trim();
  
  const calificacionVal = calificacionInput.value;
  const calificacion = calificacionVal ? parseInt(calificacionVal) : null;

  // Limpiar todos los errores previos visuales
  document.querySelectorAll('.field input, .field textarea, .field select').forEach(el => el.classList.remove('invalid'));

  // 1. Título
  if (!titulo) {
    document.getElementById('titulo').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): El título no puede estar vacío.' };
  }
  if (titulo.length > 255) {
    document.getElementById('titulo').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): El título excede los 255 caracteres.' };
  }

  // 2. Autor
  if (!autor) {
    document.getElementById('autor').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): Debes especificar el nombre del autor.' };
  }
  if (autor.length > 255) {
    document.getElementById('autor').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): El nombre del autor excede los 255 caracteres.' };
  }

  // 3. Género (Opcional, pero si está, verificar)
  if (genero && genero.length > 100) {
    document.getElementById('genero').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): El género seleccionado no es válido.' };
  }

  // 4. Páginas
  if (!paginasStr) {
    document.getElementById('paginas').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): El número de páginas es obligatorio.' };
  }
  
  const paginas = parseInt(paginasStr);
  if (isNaN(paginas) || !Number.isInteger(paginas)) {
    document.getElementById('paginas').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): Las páginas deben ser un número entero.' };
  }
  if (paginas < 1 || paginas > 10000) { // Límite razonable para un libro
    document.getElementById('paginas').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): Las páginas deben estar entre 1 y 10,000.' };
  }

  // 5. Restricción para "Por Leer" (Sin calificación)
  if (!calificacion || calificacion === 0) {
    if (fecha_inicio || fecha_fin || opinion) {
      if (fecha_inicio) document.getElementById('fecha_inicio').classList.add('invalid');
      if (fecha_fin) document.getElementById('fecha_fin').classList.add('invalid');
      if (opinion) document.getElementById('opinion').classList.add('invalid');
      return { 
        valido: false, 
        mensaje: 'Aviso (Tu Reseña): Al no elegir estrellas (Lista de Deseos), no puedes llenar fechas ni opinión.' 
      };
    }
  } else {
    // Si SÍ hay calificación, verificar que sea válida
    if (calificacion < 1 || calificacion > 5) {
       // El input hidden no puede tener clase 'invalid', así que no resaltamos, solo mostramos el error
       return { valido: false, mensaje: 'Error (Tu Reseña): La calificación debe ser un valor de 1 a 5 estrellas.' };
    }
  }

  // 6. Fechas y lógica de tiempo
  if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
    document.getElementById('fecha_fin').classList.add('invalid');
    document.getElementById('fecha_inicio').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Datos del Libro): La fecha de inicio no puede ser posterior a la fecha de término.' };
  }

  // 7. Textos largos (Resumen, Opinión, Citas) - Evitar sobrecarga en la base de datos
  if (resumen && resumen.length > 5000) {
    document.getElementById('resumen').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Tu Reseña): El resumen es demasiado largo (máximo 5000 caracteres).' };
  }
  if (opinion && opinion.length > 5000) {
    document.getElementById('opinion').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Tu Reseña): La opinión es demasiado larga (máximo 5000 caracteres).' };
  }
  if (cita && cita.length > 2000) {
    document.getElementById('cita_favorita').classList.add('invalid');
    return { valido: false, mensaje: 'Error (Tu Reseña): La cita favorita es demasiado larga (máximo 2000 caracteres).' };
  }

  return {
    valido: true,
    esPorLeer: !calificacion, // Bandera para identificar si va a la lista de deseos
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
  const { valido, datos, mensaje, esPorLeer } = validarFormulario();
  if (!valido) {
    mostrarMensaje(mensaje, 'error');
    return;
  }

  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando…';

  try {
    const response = await fetch('http://localhost:3000/api/mislecturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = `Error del servidor (${response.status})`;
      try { msg = JSON.parse(text).error || msg; } catch (_) {}
      throw new Error(msg);
    }

    // Mensaje dinámico según la condición de calificación
    const textoExito = esPorLeer ? '✦ Añadido a tu lista de deseos.' : '✦ Reseña guardada correctamente.';
    mostrarMensaje(textoExito, 'success');
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
  starHint.textContent = 'Sin calificar';
  starHint.style.color = '';
  pintarEstrellas(0);
}

// ============================================================
// 6. CARGAR Y RENDERIZAR RESEÑAS GENERALES (GET)
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
    const response = await fetch('http://localhost:3000/api/mislecturas');
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
    empty.querySelector('p').textContent = 'Error al cargar las lecturas.';
  }
}

// ============================================================
// 6B. CARGAR LIBROS POR LEER Y FAVORITOS
// ============================================================

async function cargarPorLeer() {
  const grid = document.getElementById('por-leer-container');
  if (!grid) return;
  grid.innerHTML = '<div class="state-box"><div class="spinner"></div><p>Cargando lista de deseos…</p></div>';

  try {
    const response = await fetch('http://localhost:3000/api/porleer');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const libros = await response.json();

    if (libros.length === 0) {
      grid.innerHTML = '<div class="state-box"><p>No tienes libros pendientes por leer.</p></div>';
      return;
    }

    grid.innerHTML = '';
    libros.forEach(libro => {
      grid.appendChild(crearTarjeta(libro));
    });
  } catch (err) {
    console.error('[cargar por leer]', err);
    grid.innerHTML = '<div class="state-box"><p>Error al obtener la lista de pendientes.</p></div>';
  }
}

async function cargarFavoritos() {
  const grid = document.getElementById('favoritos-container');
  if (!grid) return;
  grid.innerHTML = '<div class="state-box"><div class="spinner"></div><p>Cargando favoritos…</p></div>';

  try {
    const response = await fetch('http://localhost:3000/api/favoritos');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const libros = await response.json();

    if (libros.length === 0) {
      grid.innerHTML = '<div class="state-box"><p>Aún no tienes libros calificados con 5 estrellas ★.</p></div>';
      return;
    }

    grid.innerHTML = '';
    libros.forEach(libro => {
      grid.appendChild(crearTarjeta(libro));
    });
  } catch (err) {
    console.error('[cargar favoritos]', err);
    grid.innerHTML = '<div class="state-box"><p>Error al obtener tus favoritos.</p></div>';
  }
}

// ============================================================
// 6C. CARGAR ESTADÍSTICAS EN PANTALLA
// ============================================================

async function cargarEstadisticas() {
  try {
    const response = await fetch('http://localhost:3000/api/estadisticas');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const stats = await response.json();

    document.getElementById('stat-total-libros').textContent = stats.totalLibros;
    document.getElementById('stat-total-paginas').textContent = stats.totalPaginas;
    document.getElementById('stat-promedio').textContent = stats.promedioCalificacion;
    document.getElementById('stat-genero').textContent = stats.generoFavorito;
  } catch (err) {
    console.error('[cargar estadísticas]', err);
  }
}

// ============================================================
// 7. CREAR TARJETA DE RESEÑA 
// ============================================================

const cardTemplate = document.getElementById('review-card-template');

function crearTarjeta(libro) {
  const clone = cardTemplate.content.cloneNode(true);
  const card  = clone.querySelector('.review-card');

  const formatoMap = { Físico: 'Físico', Digital: 'Digital', Audio: 'Audio' };
  card.querySelector('.tag-format').textContent = formatoMap[libro.formato] || libro.formato;

  const genreEl = card.querySelector('.tag-genre');
  if (libro.genero) {
    genreEl.textContent = libro.genero;
  } else {
    genreEl.remove();
  }

  card.querySelector('.btn-delete').addEventListener('click', () => {
    abrirModalEliminar(libro.id, card);
  });

  card.querySelector('.card-title').textContent = libro.titulo;
  card.querySelector('.card-author').textContent = `— ${libro.autor}`;

  const starsEl = card.querySelector('.card-stars');
  const calificacionFinal = libro.calificacion || 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.textContent = '★';
    star.className = i <= calificacionFinal ? 'star-on' : 'star-off';
    starsEl.appendChild(star);
  }

  card.querySelector('.card-pages').textContent = libro.paginas ? `${libro.paginas} págs.` : '—';
  card.querySelector('.card-start').textContent  = formatearFecha(libro.fecha_inicio);
  card.querySelector('.card-end').textContent    = formatearFecha(libro.fecha_fin);

  if (libro.resumen) {
    const blk = card.querySelector('.card-summary-block');
    blk.querySelector('.card-summary').textContent = libro.resumen;
    blk.classList.remove('hidden');
  }

  if (libro.opinion) {
    const blk = card.querySelector('.card-opinion-block');
    blk.querySelector('.card-opinion').textContent = libro.opinion;
    blk.classList.remove('hidden');
  }

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
    const response = await fetch(`http://localhost:3000/api/mislecturas/${idAEliminar}`, { method: 'DELETE' });
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