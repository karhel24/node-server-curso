/**
 * Objeto process denpende del entorno donde está ejecutandose
 * la aplicacion.
 * Siempre existe en todo entorno de node
 */


// Puerto
process.env.PORT = process.env.PORT || 3000;