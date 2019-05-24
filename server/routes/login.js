const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIEND_ID);

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

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
                    message: '(Usuario) o contraseña incorrectos!'
                }
            });
        }

        if (!bCrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos!'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });



});

// Configuraciones de Google

async function verify(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIEND_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    //console.log('payload:', payload);

    return { // Lo que devuelve la PROMESA (al poner lo de async) verify
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

app.post('/google', async(req, res) => { // Se pone async para poder usar el await

    let idtoken = req.body.idtoken;

    let googleUser = await verify(idtoken)
        .catch(e => {
            return res.status(403).json({
                pk: false,
                err: e
            });
        });

    //Validaciones contra la base de datos d Mongodb
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El usuario se autenticó con user / pass. Use autenticación normal!'
                    }
                });

            } else { // Si es usuario de google autenticado, hay que RENOVAR su token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { // Crear el usuario por primera vez, con autenticacion de google

            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                password: ':)', // Para pasar la validacion de la base de datos, pero no encriptará bien y nadie podrá usarlo
                estado: true,
                google: true
            });

            // Grabar en la BBDD
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });


        }

    });


});


module.exports = app;