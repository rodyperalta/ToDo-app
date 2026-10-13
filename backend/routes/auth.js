const express = require('express');
const router = express.Router();
const {login,registrar} = require('../controllers/authController')

// Ruta para registrar usuario
router.post('/register', registrar);

// Ruta para iniciar sesión
router.post('/login', login);

module.exports = router;