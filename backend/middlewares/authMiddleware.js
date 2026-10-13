const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para proteger rutas
const proteger = async (req, res, next) => {
  let token;

  // Verificar si el header Authorization existe y tiene el formato correcto
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token sin la palabra "Bearer"
      token = req.headers.authorization.split(' ')[1];
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario en la base de datos y adjuntarlo a req (sin la contraseña)
      req.usuario = await Usuario.findById(decoded.id).select('-password');
      // Si el usuario ya no existe (fue eliminado), podríamos manejar el error
      if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Token no válido - usuario no existe' });
      }

      // Pasar al siguiente middleware/controlador
      next();
    } catch (error) {
      console.error(error);
      // Si el token no es válido (expirado, malformado, etc.)
      return res.status(401).json({ mensaje: 'Token no válido' });
    }
  }

  // Si no hay token
  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, token faltante' });
  }
};

module.exports = { proteger };