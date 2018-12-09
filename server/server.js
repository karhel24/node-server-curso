const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Eejcuta y carga todo lo que tenga el archivo (variables globales)
require('../config/config');

/***
 * El use son Middlewares
 */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json. 
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json('Hello World');
});

app.get('/usuario', function(req, res) {
    res.json('Estamos en usuario con GET');
});

// Procesar un paquete y serializarla en un objeto JSON
app.post('/usuario', function(req, res) {

    //res.json('Estamos en usuario con POST');

    // Cualquier body que procese un payload
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario.'
        });
    } else {
        res.json({
            persona: body
        });
    }


});

// :parametro
app.put('/usuario/:id', function(req, res) {
    let param_id = req.params.id;
    res.json({
        id: param_id
    });
});

app.delete('/usuario', function(req, res) {
    res.json('Estamos en usuario con DELETE');
});

app.listen(3000, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});