const express = require('express');
const app = express();
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');


// Mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') // Hace que salgan los campos nombre y email del modelo usuario
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, cuenta) => {
                res.json({
                    ok: true,
                    resultados: categorias.length,
                    categorias,
                    total: cuenta
                });
            });

        });

});

// Mostrar una categoria por id. Regresa la categoria
app.get('/categoria/:id', verificaToken, (req, res) => {

    Categoria.findById(req.params.id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada!'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// Crear nueva categoria. Regresa la nueva categoria
app.post('/categoria', verificaToken, (req, res) => {

    //req.usuario._id de la persona que realiza la accion y que tiene un token valido.

    let body = req.body;

    Usuario.findById(req.usuario._id, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario de la petición no existe en la base de datos.'
                }
            });
        }

        // Crea una nueva instancia del esquema Usuario
        let categoria = new Categoria({
            descripcion: body.descripcion,
            usuario: usuarioDB
        });

        // Grabar en la BBDD
        categoria.save((err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });

        });

    });




});


// Actualizar la categoria. Por ejemplo la descripcion
app.put('/categoria/:id', verificaToken, (req, res) => {

    let categoria_id = req.params.id;

    Categoria.findByIdAndUpdate(categoria_id, req.body, { new: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


// Borrado de la categoria. Fisicamente eliminacion
// Solo ADMIN_ROLE puede borrar y debe pedir token
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {

    Categoria.findByIdAndRemove(req.params.id, (err, categoriaRemoved) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaRemoved) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada!'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaRemoved,
            message: 'Categoria borrada'
        });
    });

});

module.exports = app;