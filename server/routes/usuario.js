const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bCrypt = require('bcrypt');
const _ = require('underscore');

const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

app.get('/', function(req, res) {
    res.json('Hello World');
});

app.get('/usuario', verificaToken, (req, res) => {

    //Uso de objetos opcionales
    let desde = Number(req.query.desde) || 0; // si no viene desde empezará desde la primera pagina. los primeros registros
    let limite = Number(req.query.limite) || 5;

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true },
                (err, cuenta) => {
                    res.json({
                        ok: true,
                        resultados: usuarios.length,
                        usuarios,
                        total: cuenta
                    });
                });

        });
});

// Procesar un paquete y serializarla en un objeto JSON
app.post('/usuario', [verificaToken, verificaAdminRol], (req, res) => {

    //res.json('Estamos en usuario con POST');

    // Cualquier body que procese un payload
    let body = req.body;

    // Crea una nueva instancia del esquema Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bCrypt.hashSync(body.password, 10),
        role: body.role,
        estado: true
    });

    // Grabar en la BBDD
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Se quita el password de la respuesta
        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

// El PUT va a tener validaciones sobre qué campos ha de ser enviados para el put.
/*
    { new: true,  => Devuelve el objeto tras el uodate
        runValidators: true => Pasa las validaciones del esquema antes de hacer el update
    }

    https://underscorejs.org/
*/
// :parametro
app.put('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {

    let param_id = req.params.id;
    let param_body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'] // Array de todos los campos que SI pueden actualizarse
    );

    Usuario.findByIdAndUpdate(param_id, param_body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.delete('/usuario/:id', [verificaToken, verificaAdminRol], function(req, res) {

    let id = req.params.id;

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado!'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;