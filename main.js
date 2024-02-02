"use strict";

/******************Elementos del DOM**********************/

const formulario = document.querySelector("form");
const divErrores = document.querySelector("#divErrores");
const btnGuardarPreguntas = document.querySelector("#btnGuardarPreguntas");
const btnBorrarPreguntas = document.querySelector("#btnBorrarPreguntas");
const btnGenerarArchivo = document.querySelector("#btnGenerarArchivo");
const divPreguntas = document.querySelector("#divPreguntas");
const mensajeInfo = document.querySelector("#divInfo .mensajeInfo");
const btnCloseInfo = document.querySelector("#divInfo button");

/******************Event Listeners************************/

//Submit del formulario. Solo se ejecutará al hacer click en el botón crear pregunta, que es el único de tipo input submit
formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = {
    id: e.target.txtId.value,
    texto: e.target.txtPregunta.value,
    respuestaCorrecta: e.target.txtCorrecta.value,
    respuestasIncorrectas: Array.from(e.target.incorrectas).map(
      (elem) => elem.value
    ),
  };
  if (validarFormulario(datos)) {
    crearPregunta(datos);
    e.target.reset();
    e.target.txtId.value = "0";
    divErrores.innerHTML = "";
  } else divErrores.innerHTML = "<p>Por favor, rellene todos los campos.</p>";
});

btnGuardarPreguntas.addEventListener("click", guardarCuestionario);

btnBorrarPreguntas.addEventListener("click", eliminarCuestionario);

btnGenerarArchivo.addEventListener("click", generarArchivoPreguntas);

btnCloseInfo.addEventListener("click", () => {
  mensajeInfo.parentElement.classList.add("hidden");
  mensajeInfo.innerHTML = "";
});

/******************Funciones******************************/

//Recupera los datos de un cuestionario almacenado en localStorage y los vuelve objetos. Si no hay datos almacenados, devuelve uno nuevo.
function obtenerCuestionario() {
  const cuestionario = new Cuestionario();
  if (localStorage.getItem("cuestionario")) {
    const oJSON = JSON.parse(localStorage.getItem("cuestionario"));
    oJSON.preguntas.forEach((pregunta) => {
      cuestionario.añadirPregunta(
        new Pregunta(
          pregunta.id,
          pregunta.texto,
          pregunta.respuestaCorrecta,
          pregunta.respuestasIncorrectas
        )
      );
    });
  }
  return cuestionario;
}

//Valida que todos los campos estén rellenos
function validarFormulario(objetoFormulario) {
  let isValid = true;
  for (let campo in objetoFormulario) {
    if (campo === "respuestasIncorrectas") {
      for (let contenido of objetoFormulario[campo]) {
        if (contenido.trim() === "") {
          isValid = false;
          break;
        }
      }
    } else if (objetoFormulario[campo].trim() === "") {
      isValid = false;
      break;
    }
  }
  return isValid;
}

//Devuelve una id siguiente a la última usada
function nuevaId() {
  if (cuestionario.preguntas.length > 0) {
    return Number(cuestionario.preguntas[cuestionario.preguntas.length - 1].id) + 1;
  }
  return 1;
}

//Creamos el objeto Pregunta y lo añadimos al cuestionario
function crearPregunta(pregunta) {
  let id;
  //Si la pregunta es nueva, pedimos una id nueva. Si no, es que estamos editando una pregunta guardada, primero conservamos su id y la eliminamos del cuestionario.
  if (pregunta.id === "0") id = nuevaId();
  else {
    id = Number(pregunta.id);
    cuestionario.descartarPregunta(id);
  }

  const preguntaAGuardar = new Pregunta(
    id,
    escaparCaracteres(pregunta.texto),
    escaparCaracteres(pregunta.respuestaCorrecta),
    pregunta.respuestasIncorrectas.map((respuesta) =>
      escaparCaracteres(respuesta)
    )
  );

  cuestionario.añadirPregunta(preguntaAGuardar);
  mostrarMensaje("Pregunta añadida correctamente.");
  refrescarCuestionario();
}

//Funcion para escapar los caracteres no permitidos
function escaparCaracteres(cadena) {
  const caracteresAEscapar = /([~#={}:])/g;
  return cadena.replace(caracteresAEscapar, "\\$1");
}

//Funcion para desescapar los caracteres no permitidos
function desescaparCaracteres(cadena) {
  const caracteresADesescapar = /\\/g;
  return cadena.replace(caracteresADesescapar, "");
}

//Guarda el cuestionario en localStorage
function guardarCuestionario() {
  localStorage.setItem("cuestionario", JSON.stringify(cuestionario));
  mostrarMensaje("Todas las preguntas han sido guardadas.");
}

//Elimina el cuestionario del localStorage
function eliminarCuestionario() {
  localStorage.removeItem("cuestionario");
  cuestionario = new Cuestionario();
  mostrarMensaje("Todas las preguntas han sido borradas.");
  refrescarCuestionario();
}

//Muestra mensaje al usuario de la última operación realizada
function mostrarMensaje(mensaje) {
  mensajeInfo.innerHTML = mensaje;
  mensajeInfo.parentElement.classList.remove("hidden");
  setTimeout(() => {
    mensajeInfo.parentElement.classList.add("hidden");
    mensajeInfo.innerHTML = "";
  }, 5000);
}

//Recupera una pregunta y rellena el formulario para editar
function recuperarPregunta(id) {
  let pregunta = cuestionario.getPregunta(id);
  formulario.txtId.value = pregunta.id;
  formulario.txtPregunta.value = desescaparCaracteres(pregunta.texto);
  formulario.txtCorrecta.value = desescaparCaracteres(
    pregunta.respuestaCorrecta
  );
  formulario.incorrectas.forEach(
    (input, index) =>
      (input.value = desescaparCaracteres(
        pregunta.respuestasIncorrectas[index]
      ))
  );
  formulario.scrollIntoView({behavior: "smooth"})
}

//Elimina una pregunta del cuestionario
function descartarPregunta(id) {
  cuestionario.descartarPregunta(id);
  refrescarCuestionario();
}

//Función que refresca por pantalla los datos almacenados en el cuestionario
function refrescarCuestionario() {
  let respuesta = "";
  if (cuestionario.preguntas.length > 0) {
    cuestionario.preguntas.sort((a, b) => a.id - b.id);
    for (let pregunta of cuestionario.preguntas) {
      respuesta += cuestionario.preguntaToHTMLDiv(pregunta.id);
    }
  } else respuesta = "<p>Todavía no hay preguntas creadas</p>";
  divPreguntas.innerHTML = respuesta;
}

//Imprimir fichero de texto
function generarArchivoPreguntas() {
  let arrContenido = [];
  cuestionario.preguntas.forEach((pregunta) => {
    arrContenido.push(pregunta.texto + "\n");
    arrContenido.push("{\n");
    arrContenido.push("=" + pregunta.respuestaCorrecta + "\n") 
    pregunta.respuestasIncorrectas.forEach((respuestaIncorrecta) => {
      arrContenido.push("~%-25%" + respuestaIncorrecta + "\n");
    })
    arrContenido.push("}\n\n");
  });
  const fichero = new File(arrContenido, {type: "text/plain; charset=UTF-8"});
  const url = window.URL.createObjectURL(fichero);
  mostrarMensaje(`<a download="preguntas.txt" href="${url}">Descargar fichero</a>`);
}

/******************************MAIN***************************/

let cuestionario = obtenerCuestionario();
refrescarCuestionario();
