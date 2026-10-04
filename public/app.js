const COLORES = {
  acento: '#7c9cff',
  ok: '#5fd39a',
  aviso: '#f5b35a',
  peligro: '#f27a7a',
  neutro: '#8fa0bd',
  texto: '#94a3c0',
  linea: 'rgba(36, 50, 82, 0.8)'
};

const COLOR_POR_ESTADO = {
  ACTIVA: COLORES.ok,
  VENCIDA: COLORES.aviso,
  CANCELADA: COLORES.peligro
};

if (window.Chart) {
  Chart.defaults.color = COLORES.texto;
  Chart.defaults.borderColor = COLORES.linea;
  Chart.defaults.font.family = '"Figtree", "Segoe UI", system-ui, sans-serif';
  Chart.defaults.font.size = 13;
  Chart.defaults.maintainAspectRatio = false;
}

function esc(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function etiquetaEstado(estado) {
  const clase = String(estado || '').toLowerCase().replace(/[^a-z]/g, '');
  return `<span class="estado estado-${clase}">${esc(estado)}</span>`;
}

function filaVacia(lista, columnas, texto) {
  lista.innerHTML = `<tr><td class="vacio" colspan="${columnas}">${texto}</td></tr>`;
}

let graficoPolizas;
let graficoTipos;
let graficoMeses;

async function cargarClientes() {
  const respuesta = await fetch('/clientes');
  const clientes = await respuesta.json();

  const lista = document.getElementById('lista-clientes');
  lista.innerHTML = '';

  if (clientes.length === 0) {
    filaVacia(lista, 6, 'Todavía no hay clientes cargados.');
    return;
  }

  clientes.forEach((cliente) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${cliente.id_cliente}</td>
      <td>${esc(cliente.nombre)}</td>
      <td>${esc(cliente.apellido)}</td>
      <td>${esc(cliente.dni)}</td>
      <td>${esc(cliente.email)}</td>
    `;

    const celdaAcciones = document.createElement('td');

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.classList.add('boton-eliminar');

    const botonModificar = document.createElement('button');
botonModificar.textContent = 'Modificar email';
botonModificar.classList.add('boton-modificar');

botonModificar.addEventListener('click', async () => {
  const nuevoEmail = prompt(
    `Nuevo email para ${cliente.nombre} ${cliente.apellido}:`,
    cliente.email
  );

  if (nuevoEmail === null) {
    return;
  }

  const respuesta = await fetch(`/clientes/${cliente.id_cliente}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: nuevoEmail })
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  cargarClientes();
  cargarDashboard();
});

    botonEliminar.addEventListener('click', async () => {
      const confirmar = confirm(
        `¿Querés eliminar a ${cliente.nombre} ${cliente.apellido}?`
      );

      if (!confirmar) {
        return;
      }

      const respuesta = await fetch(`/clientes/${cliente.id_cliente}`, {
        method: 'DELETE'
      });

      const resultado = await respuesta.json();

      alert(resultado.mensaje);

      cargarClientes();
      cargarDashboard();
    });

    celdaAcciones.appendChild(botonModificar);
celdaAcciones.appendChild(botonEliminar);
    fila.appendChild(celdaAcciones);
    lista.appendChild(fila);
  });
}

document.getElementById('form-cliente').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nuevoCliente = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    dni: document.getElementById('dni').value,
    email: document.getElementById('email').value
  };

  const respuesta = await fetch('/clientes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevoCliente)
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  document.getElementById('form-cliente').reset();

  cargarClientes();
  cargarDashboard();
});


async function cargarPolizas() {
  const respuesta = await fetch('/polizas');
  const polizas = await respuesta.json();

  const lista = document.getElementById('lista-polizas');
  lista.innerHTML = '';

  if (polizas.length === 0) {
    filaVacia(lista, 7, 'Todavía no hay pólizas cargadas.');
    return;
  }

  polizas.forEach((poliza) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${poliza.id_poliza}</td>
      <td>${esc(poliza.numero_poliza)}</td>
      <td>${poliza.id_cliente}</td>
      <td>${poliza.fecha_inicio}</td>
      <td>${poliza.fecha_fin}</td>
      <td>${etiquetaEstado(poliza.estado)}</td>
    `;

    const celdaAcciones = document.createElement('td');

const botonModificar = document.createElement('button');
botonModificar.textContent = 'Modificar';
botonModificar.classList.add('boton-modificar');

botonModificar.addEventListener('click', async () => {
  const fechaInicio = prompt(
    'Nueva fecha de inicio (AAAA-MM-DD):',
    poliza.fecha_inicio
  );

  if (fechaInicio === null) return;

  const fechaFin = prompt(
    'Nueva fecha de fin (AAAA-MM-DD):',
    poliza.fecha_fin
  );

  if (fechaFin === null) return;

  const estado = prompt(
    'Nuevo estado: ACTIVA, VENCIDA o CANCELADA',
    poliza.estado
  );

  if (estado === null) return;

  const respuesta = await fetch(`/polizas/${poliza.id_poliza}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: estado
    })
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  cargarPolizas();
  cargarDashboard();
});

const botonEliminar = document.createElement('button');
botonEliminar.textContent = 'Eliminar';
botonEliminar.classList.add('boton-eliminar');

botonEliminar.addEventListener('click', async () => {
  const confirmar = confirm(
    `¿Querés eliminar la póliza ${poliza.numero_poliza}?`
  );

  if (!confirmar) return;

  const respuesta = await fetch(`/polizas/${poliza.id_poliza}`, {
    method: 'DELETE'
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  cargarPolizas();
  cargarDashboard();
});

celdaAcciones.appendChild(botonModificar);
celdaAcciones.appendChild(botonEliminar);
fila.appendChild(celdaAcciones);
lista.appendChild(fila);
  });
}


document.getElementById('form-poliza').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nuevaPoliza = {
    numero_poliza: document.getElementById('numero-poliza').value,
    id_cliente: document.getElementById('id-cliente-poliza').value,
    fecha_inicio: document.getElementById('fecha-inicio').value,
    fecha_fin: document.getElementById('fecha-fin').value,
    estado: document.getElementById('estado-poliza').value
  };

  const respuesta = await fetch('/polizas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaPoliza)
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  document.getElementById('form-poliza').reset();

  cargarPolizas();
  cargarDashboard();
});


async function cargarSiniestros() {
  const respuesta = await fetch('/siniestros');
  const siniestros = await respuesta.json();

  const lista = document.getElementById('lista-siniestros');
  lista.innerHTML = '';

  if (siniestros.length === 0) {
    filaVacia(lista, 6, 'Todavía no hay siniestros cargados.');
    return;
  }

  siniestros.forEach((siniestro) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${siniestro.id_siniestro}</td>
      <td>${siniestro.id_poliza}</td>
      <td>${siniestro.fecha}</td>
      <td>${esc(siniestro.tipo)}</td>
      <td>${etiquetaEstado(siniestro.estado)}</td>
    `;

    const celdaAcciones = document.createElement('td');
    const botonModificar = document.createElement('button');
botonModificar.textContent = 'Modificar';
botonModificar.classList.add('boton-modificar');

botonModificar.addEventListener('click', async () => {
  const fecha = prompt(
    'Nueva fecha (AAAA-MM-DD):',
    siniestro.fecha
  );

  if (fecha === null) return;

  const tipo = prompt(
    'Nuevo tipo de accidente:',
    siniestro.tipo
  );

  if (tipo === null) return;

  const estado = prompt(
    'Nuevo estado: ABIERTO o CERRADO',
    siniestro.estado
  );

  if (estado === null) return;

  const respuesta = await fetch(`/siniestros/${siniestro.id_siniestro}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fecha: fecha,
      tipo: tipo,
      estado: estado
    })
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  cargarSiniestros();
  cargarDashboard();
});

const botonEliminar = document.createElement('button');
botonEliminar.textContent = 'Eliminar';
botonEliminar.classList.add('boton-eliminar');

botonEliminar.addEventListener('click', async () => {
  const confirmar = confirm(
    `¿Querés eliminar el siniestro ${siniestro.id_siniestro}?`
  );

  if (!confirmar) return;

  const respuesta = await fetch(`/siniestros/${siniestro.id_siniestro}`, {
    method: 'DELETE'
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  cargarSiniestros();
  cargarDashboard();
});

celdaAcciones.appendChild(botonModificar);
celdaAcciones.appendChild(botonEliminar);
fila.appendChild(celdaAcciones);
lista.appendChild(fila);
  });
}



document.getElementById('form-siniestro').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nuevoSiniestro = {
    id_poliza: document.getElementById('id-poliza-siniestro').value,
    fecha: document.getElementById('fecha-siniestro').value,
    tipo: document.getElementById('tipo-siniestro').value,
    estado: document.getElementById('estado-siniestro').value
  };

  const respuesta = await fetch('/siniestros', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevoSiniestro)
  });

  const resultado = await respuesta.json();

  alert(resultado.mensaje);

  document.getElementById('form-siniestro').reset();

  cargarSiniestros();
  cargarDashboard();
});


function actualizarGraficos(polizas, siniestros) {
  const polizasPorEstado = {};
  const siniestrosPorTipo = {};
  const siniestrosPorMes = {};

  polizas.forEach((poliza) => {
    if (!polizasPorEstado[poliza.estado]) {
      polizasPorEstado[poliza.estado] = 0;
    }

    polizasPorEstado[poliza.estado]++;
  });

  siniestros.forEach((siniestro) => {
    if (!siniestrosPorTipo[siniestro.tipo]) {
      siniestrosPorTipo[siniestro.tipo] = 0;
    }

    siniestrosPorTipo[siniestro.tipo]++;

    const mes = siniestro.fecha.substring(0, 7);

    if (!siniestrosPorMes[mes]) {
      siniestrosPorMes[mes] = 0;
    }

    siniestrosPorMes[mes]++;
  });

  if (graficoPolizas) graficoPolizas.destroy();
  if (graficoTipos) graficoTipos.destroy();
  if (graficoMeses) graficoMeses.destroy();

  graficoPolizas = new Chart(
    document.getElementById('grafico-polizas'),
    {
      type: 'doughnut',
      data: {
        labels: Object.keys(polizasPorEstado),
        datasets: [{
          data: Object.values(polizasPorEstado),
          backgroundColor: Object.keys(polizasPorEstado).map(
            (estado) => COLOR_POR_ESTADO[estado] || COLORES.neutro
          ),
          borderColor: '#111a2e',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8, padding: 18 }
          }
        }
      }
    }
  );

  graficoTipos = new Chart(
    document.getElementById('grafico-tipos'),
    {
      type: 'bar',
      data: {
        labels: Object.keys(siniestrosPorTipo),
        datasets: [{
          label: 'Cantidad de siniestros',
          data: Object.values(siniestrosPorTipo),
          backgroundColor: COLORES.acento,
          borderRadius: 6,
          maxBarThickness: 56
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    }
  );

  const mesesOrdenados = Object.keys(siniestrosPorMes).sort();

  graficoMeses = new Chart(
    document.getElementById('grafico-meses'),
    {
      type: 'line',
      data: {
        labels: mesesOrdenados,
        datasets: [{
          label: 'Cantidad de siniestros',
          data: mesesOrdenados.map((mes) => siniestrosPorMes[mes]),
          borderColor: COLORES.ok,
          backgroundColor: COLORES.ok,
          pointBackgroundColor: COLORES.ok,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    }
  );
}



async function cargarDashboard() {
  const respuestas = await Promise.all([
    fetch('/clientes'),
    fetch('/polizas'),
    fetch('/siniestros')
  ]);

  const clientes = await respuestas[0].json();
  const polizas = await respuestas[1].json();
  const siniestros = await respuestas[2].json();

  document.getElementById('total-clientes').textContent = clientes.length;

  document.getElementById('polizas-activas').textContent =
    polizas.filter((poliza) => poliza.estado === 'ACTIVA').length;

  document.getElementById('siniestros-abiertos').textContent =
    siniestros.filter((siniestro) => siniestro.estado === 'ABIERTO').length;

  document.getElementById('siniestros-cerrados').textContent =
    siniestros.filter((siniestro) => siniestro.estado === 'CERRADO').length;
    actualizarGraficos(polizas, siniestros);
}


cargarClientes();
cargarPolizas();
cargarSiniestros();
cargarDashboard();