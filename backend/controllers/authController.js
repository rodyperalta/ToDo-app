const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

// Generar token
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Registrar un nuevo usuario
const registrar = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar que email y password estén presentes
    if (!email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Email y password son requeridos" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Crear nuevo usuario (la contraseña se hashea automáticamente por el pre-save del modelo)
    const usuario = new Usuario({ email, password });
    await usuario.save();

    // Responder con el token y datos básicos del usuario (sin password)
    res.status(201).json({
      usuario: {
        id: usuario._id,
        email: usuario.email,
      },
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error); // pasa el error al middleware centralizado
  }
};

// Iniciar sesión
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ mensaje: "Email y password son requeridos" });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({
      usuario: {
        id: usuario._id,
        email: usuario.email,
      },
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, login };
