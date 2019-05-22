// Ejecuta y carga todo lo que tenga el archivo (variables globales)
require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



var options = {

    useNewUrlParser: true,
    useCreateIndex: true
};

/***
 * El use son Middlewares
 */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json. 
app.use(bodyParser.json());

app.use(require('./routes/usuario.js'));

// Base de datos
mongoose.connect(process.env.URLDB, options, (err, res) => {
    if (err) throw err;

    console.log('Base de datos Online!');

});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});