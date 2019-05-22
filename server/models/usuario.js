/**
 * Encargado de manejar el modelo de base de datos
 */

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Definimos los roles permitidos
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido.'
}

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        require: [true, 'El nombre es necesario'] // Para poner mensaje personalizados
    },
    email: {
        type: String,
        unique: true,
        require: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        require: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        require: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

});

// Para modificar el metodo toJSON que siempre se llama. 
// Modificaremos para quitar el password del objeto que se devuelve en el jSON
usuarioSchema.methods.toJSON = function() {
    let user = this; //OJO! No se usa una arrow function y SI una function para poder usar el this y su context
    let userObject = user.toObject(); // Asi tenemos las propiedades y metodos
    delete userObject.password; // Se quita el campo password del objeto que se devuelve a pintar en toJSON

    return userObject;
}

// Que es esquema use el plugin mongoose-unique-validator
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único.' });

module.exports = mongoose.model('Usuario', usuarioSchema);