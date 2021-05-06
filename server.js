const express = require("express");
const logger = require("morgan");

const nlp = require('./app/nlp/index');



var jwt = require("jsonwebtoken");

const app = express();

app.set("secretKey", "ClaveSecreta"); // Clave Secreta para nuestro JWT

app.use('/nlp', nlp);

app.use(logger("dev"));

// Manejando errores HTTP 404 para solicitudes de contenido inexistente
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// Manejo de errores, respuestas con codigo HTTP 500, HTTP 404
app.use(function (err, req, res, next) {
  console.log(err);

  if (err.status === 404) res.status(404).json({ message: "Not found" });
  else res.status(500).json({ message: "Error interno en el servidor!!" });
});
app.listen(3000, function () {
  console.log("El servidor ha sido inicializado: http://localhost:3000");
});
