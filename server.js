const express = require("express");
const logger = require("morgan");
const bodyParser = require('body-parser');

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: (process.env.SMTP_SECURE === "true"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls:{
    ciphers:'SSLv3'
  }
});

app.post('/send', (req, res) => {
  try {
    let fromName = process.env.FROM_NAME;
    let toEmail =  process.env.SMTP_USER;  
    let subject =  req.body.subject;
    let textBody = req.body.textBody;
    let htmlBody = req.body?.htmlBody;

    if (!subject || typeof subject !== 'string') {
      throw new TypeError('Subject was not defined')
    }
    if (!toEmail || typeof toEmail !== 'string') {
      throw new TypeError('To Email was not defined')
    }

    let mailOptions = {
      from: fromName + '<' + process.env.FROM_EMAIL + '>',
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new TypeError(error.message)
      }
      console.log('Mensaje %s enviado: %s', info.messageId, info.response)
      res.json({
        message: 'Mensaje enviado exitosamente'
      })
    })
  } catch (error) {
    res.status(500)
    res.json({
      error: error.message
    })
    console.error('Ocurrió un error:')
    console.error(error.message)
  }
});

app.use(logger("dev"));

// Manejando errores HTTP 404 para solicitudes de contenido inexistente
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// Manejo de errores, respuestas con codigo HTTP 500, HTTP 404
app.use((err, req, res, next) => {
  console.log(err);

  if (err.status === 404) res.status(404).json({ message: "Not found" });
  else res.status(500).json({ message: "Error interno en el servidor!!" });
});
app.listen(3000, () => {
  console.log("El servidor ha sido inicializado: http://localhost:3000");
});
