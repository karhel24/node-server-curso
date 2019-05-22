/**
 * Objeto process denpende del entorno donde está ejecutandose
 * la aplicacion.
 * Siempre existe en todo entorno de node
 */


// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://cafe:cafe@localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://cgs_admin:mI43AyCrd3u6cw0F@cluster0-cyd16.mongodb.net/cafe';
}


process.env.URLDB = urlDB;