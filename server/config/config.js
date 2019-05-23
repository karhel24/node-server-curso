/**
 * Objeto process denpende del entorno donde está ejecutandose
 * la aplicacion.
 * Siempre existe en todo entorno de node
 */


// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Vencimiento del token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// Seed. Semilla de autenticacion

process.env.SEED = process.env.SEED || 'este-es-el-seed_desarrollo';

// Base de datos

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://cafe:cafe@localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URIDB;
}


process.env.URLDB = urlDB;