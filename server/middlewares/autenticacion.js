const jwt = require('jsonwebtoken');

/**
 * 
 * Verificar Token
 */

let verificaToken = (req, res, next) => {

    let token = req.get('token'); // get para obtener los headers

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        // Culquier peticion tenga acceso a la informacion del usuario tras verificar el toke
        req.usuario = decoded.usuario; // Usamos el payload del token decodificado
        next();
    });



}

/**
 * Verificar Admin ROLE
 */
let verificaAdminRol = (req, res, next) => {


    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();

    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'No tiene el rol de Administrador.'
            }
        });
    }



}

/**
 * 
 * Verificar Token para Imagen
 */

let verificaTokenImagen = (req, res, next) => {

    let token = req.query.token; // query para obtener de la URL

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        // Culquier peticion tenga acceso a la informacion del usuario tras verificar el toke
        req.usuario = decoded.usuario; // Usamos el payload del token decodificado
        next();
    });

}

module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImagen
}