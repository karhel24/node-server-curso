const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');

const Producto = require('../models/producto');
const Categoria = require('../models/categoria');

/**
 * Obtener todos los productos
 * 
 * populate: usuario categoria
 */
app.get('/producto', verificaToken, (req, res) => {

    //Uso de objetos opcionales
    let desde = Number(req.query.desde) || 0; // si no viene desde empezará desde la primera pagina. los primeros registros
    let limite = Number(req.query.limite) || 5;

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('categoria', 'descripcion') // Hace que salgan los campos descripcion del modelo categoria
        .populate('usuario', 'nombre email') // Hace que salgan los campos nombre y email del modelo usuario
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, cuenta) => {
                res.json({
                    ok: true,
                    resultados: productos.length,
                    productos,
                    total: cuenta
                });
            });

        });

});

/**
 * Busquedas
 */
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regexp = new RegExp(termino, 'i');

    Producto.find({ disponible: true, nombre: regexp })
        .sort('nombre')
        .populate('categoria', 'descripcion') // Hace que salgan los campos descripcion del modelo categoria
        .populate('usuario', 'nombre email') // Hace que salgan los campos nombre y email del modelo usuario
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, cuenta) => {
                res.json({
                    ok: true,
                    resultados: productos.length,
                    productos,
                    total: cuenta
                });
            });

        });

});

/**
 * Obtener producto
 * 
 * populate: usuario categoria
 */

app.get('/producto/:id', verificaToken, (req, res) => {

    Producto.findById(req.params.id)
        .populate('categoria', 'descripcion') // Hace que salgan los campos descripcion del modelo categoria
        .populate('usuario', 'nombre email') // Hace que salgan los campos nombre y email del modelo usuario
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado!'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

/**
 * Crear nuevo producto 
 * 
 * Grabar el usuario
 * Grabar la categoria

 */
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let categoria_descripcion = body.categoria;
    let usuario = req.usuario;

    //console.log(req);

    Categoria.findOne({ descripcion: categoria_descripcion }, 'descripcion', (err, categoriaDB) => {

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
                    message: `La categoria ${categoria_descripcion} no existe en la base de datos.`
                }
            });
        }

        // Crea una nueva instancia del esquema Producto
        let producto = new Producto({
            nombre: body.descripcion,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: true,
            usuario: usuario,
            categoria: categoriaDB

        });

        // Grabar en la BBDD
        producto.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

    });


});

/**
 * Actualizar producto
 * 
 */
app.put('/producto/:id', verificaToken, (req, res) => {

    let body = req.body;
    let producto_id = req.params.id;
    let categoria_descripcion = body.categoria;
    let usuario = req.usuario;

    Categoria.findOne({ descripcion: categoria_descripcion }, 'descripcion', (err, categoriaDB) => {

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
                    message: `La categoria ${categoria_descripcion} no existe en la base de datos.`
                }
            });
        }


        let producto = {
            nombre: body.descripcion,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: true,
            usuario: usuario,
            categoria: categoriaDB

        };

        Producto.findByIdAndUpdate(producto_id, producto, { new: true }, (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoDB
            });
        });

    });



});

/**
 * Borrar producto
 * Usar disponible para no borrar fisicamente. Campo disponible a false
 */
app.delete('/producto/:id', verificaToken, (req, res) => {

    let producto_id = req.params.id;

    Producto.findById(producto_id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto a eliminar no existe.'
                }
            });
        }
        productoDB.disponible = false;

        productoDB.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoDB
            });

        });


    });

});


module.exports = app;