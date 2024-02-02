"use strict";
/****************** Clase Pregunta *********************/
class Pregunta {
  constructor(id, texto, respuestaCorrecta, respuestasIncorrectas) {
    this.id = id;
    this.texto = texto;
    this.respuestaCorrecta = respuestaCorrecta;
    this.respuestasIncorrectas = respuestasIncorrectas;
  }
}

Pregunta.prototype.toHTMLUl = function () {
  let respuesta = `
  <ul>
    <li>${this.texto}</li>
    <li>${this.respuestaCorrecta}</li>`

  for (let txtIncorrecta of this.respuestasIncorrectas) {
    respuesta += `<li>${txtIncorrecta}</li>`;
  }
  
  respuesta += "</ul>";
  return respuesta;
};

/****************** Clase Cuestionario *********************/
class Cuestionario {
  constructor(preguntas = []) {
    this.preguntas = preguntas;
  }
}

Cuestionario.prototype.añadirPregunta = function (pregunta) {
  this.preguntas.push(pregunta);
};

Cuestionario.prototype.descartarPregunta = function (id) {
  const indice = this.preguntas.findIndex((pregunta) => pregunta.id === id);
  this.preguntas.splice(indice, 1);
};

Cuestionario.prototype.preguntaToHTMLDiv = function (id) {
  let respuesta = "<p>Pregunta no encontrada</p>";
  const pregunta = this.getPregunta(id);

  if (pregunta) {
    respuesta = `
    <div class="pregunta">
      <div class="contenido">${pregunta.toHTMLUl()}</div>
      <div class="botones">
        <button onclick="descartarPregunta(${id})">Descartar pregunta</button>
        <button onclick="recuperarPregunta(${id})">Recuperar pregunta</button>
      </div>
    </div>`;   
  }
  return respuesta;
};

Cuestionario.prototype.getPregunta = function (id) {
  return this.preguntas.find((pregunta) => pregunta.id === id);
};