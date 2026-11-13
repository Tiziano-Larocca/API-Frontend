const API_URL = "https://api-backend-dzzn.onrender.com/api/students";

function obtenerEstudiantes() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
        })
        .catch(error => {
            console.error('Hubo un problema con la operación fetch:', error.message);
        });
}

function obtenerEstudiantePorId(id) {
  fetch(`${API_URL}/${id}`)
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((estudiante) => {
      console.log(`Datos del estudiante con ID ${id}:`, estudiante);
    })
    .catch((error) => {
      console.error(`Error en GET por ID (${id}):`, error.message);
    });
}

function crearEstudiante(nuevoEstudiante) {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nuevoEstudiante)
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((datosCreados) => {
      console.log("Estudiante creado con éxito:", datosCreados);
    })
    .catch((error) => {
      console.error("Error en POST:", error.message);
    });
}

function actualizarEstudiante(id, datosActualizados) {
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosActualizados)
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((datosModificados) => {
      console.log("Estudiante actualizado con éxito:", datosModificados);
    })
    .catch((error) => {
      console.error("Error en PUT:", error.message);
    });
}

function eliminarEstudiante(id) {
  fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      console.log(`Estudiante con ID ${id} eliminado. Estado: ${response.status}`);
    })
    .catch((error) => {
      console.error("Error en DELETE:", error.message);
    });
}

const cuerpoTabla = document.getElementById("tbody");
const mensajeVacio = document.getElementById("empty");

const modalFormulario = document.getElementById("dlgForm");
const modalBorrar = document.getElementById("dlgDelete");

const formulario = document.getElementById("studentForm");
const tituloFormulario = document.getElementById("formTitle");
const botonGuardar = document.getElementById("formSubmit");

const botonAnadir = document.getElementById("btnAdd");
const botonConfirmarBorrado = document.getElementById("confirmDelete");
const textoBorrar = document.getElementById("deleteText");

let estudiantes = [];          
let idParaBorrar = null;       

const fetchOriginal = window.fetch.bind(window);

window.fetch = (url, opciones) => {
  const metodo = ((opciones && opciones.method) || "GET").toUpperCase();
  const peticion = fetchOriginal(url, opciones);

  if (metodo !== "GET") {
    peticion
      .then((respuesta) => {
        if (respuesta.ok) cargarTabla();
      })
      .catch(() => {}); 
  }

  return peticion;
};

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function crearFila(estudiante) {
  return `
    <tr>
      <td>${estudiante.id}</td>
      <td>${escaparHtml(estudiante.firstName)}</td>
      <td>${escaparHtml(estudiante.lastName)}</td>
      <td>${escaparHtml(estudiante.email)}</td>
      <td>${estudiante.age}</td>
      <td class="col-actions">
        <button class="btn btn--sm" data-accion="actualizar" data-id="${estudiante.id}">Actualizar</button>
        <button class="btn btn--sm btn--danger" data-accion="borrar" data-id="${estudiante.id}">Borrar</button>
      </td>
    </tr>`;
}

function mostrarTabla() {
  mensajeVacio.hidden = estudiantes.length > 0;
  cuerpoTabla.innerHTML = estudiantes.map(crearFila).join("");
}

async function cargarTabla() {
  try {
    const respuesta = await fetchOriginal(API_URL);
    if (!respuesta.ok) throw new Error(respuesta.status);

    estudiantes = await respuesta.json();
    mostrarTabla();
  } catch (error) {
    console.error("No se pudo cargar la lista de estudiantes:", error.message);
  }
}

function abrirFormulario(estudiante) {
  const esEdicion = Boolean(estudiante);

  formulario.reset();
  formulario.id.value = esEdicion ? estudiante.id : "";

  if (esEdicion) {
    formulario.firstName.value = estudiante.firstName;
    formulario.lastName.value = estudiante.lastName;
    formulario.email.value = estudiante.email;
    formulario.age.value = estudiante.age;
  }

  tituloFormulario.textContent = esEdicion ? "Actualizar estudiante" : "Añadir estudiante";
  botonGuardar.textContent = esEdicion ? "Actualizar" : "Crear";
  modalFormulario.showModal();
}

function leerDatosFormulario() {
  return {
    firstName: formulario.firstName.value.trim(),
    lastName: formulario.lastName.value.trim(),
    email: formulario.email.value.trim(),
    age: Number(formulario.age.value),
  };
}

function guardarFormulario(evento) {
  evento.preventDefault();

  const id = formulario.id.value;
  const datos = leerDatosFormulario();

  if (id) {
    actualizarEstudiante(id, datos);
  } else {
    crearEstudiante(datos);
  }

  modalFormulario.close();
}

function abrirConfirmacionBorrado(estudiante) {
  idParaBorrar = estudiante.id;
  textoBorrar.textContent =
    `${estudiante.firstName} ${estudiante.lastName} (${estudiante.email}). ` +
    "Esta acción no se puede deshacer.";
  modalBorrar.showModal();
}

function confirmarBorrado() {
  eliminarEstudiante(idParaBorrar);
  modalBorrar.close();
}

botonAnadir.addEventListener("click", () => abrirFormulario(null));

cuerpoTabla.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const estudiante = estudiantes.find((e) => e.id == boton.dataset.id);

  if (boton.dataset.accion === "actualizar") abrirFormulario(estudiante);
  if (boton.dataset.accion === "borrar") abrirConfirmacionBorrado(estudiante);
});

formulario.addEventListener("submit", guardarFormulario);
botonConfirmarBorrado.addEventListener("click", confirmarBorrado);

[modalFormulario, modalBorrar].forEach((modal) => {
  modal.addEventListener("click", (evento) => {
    const clicEnFondo = evento.target === modal;
    const clicEnCancelar = evento.target.dataset.close !== undefined;
    if (clicEnFondo || clicEnCancelar) modal.close();
  });
});

cargarTabla();
