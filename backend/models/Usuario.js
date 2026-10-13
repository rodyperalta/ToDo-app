const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // No puede haber dos usuarios con el mismo email
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Opcional, para validar longitud mínima
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

// Middleware de Mongoose: antes de guardar, hashear la contraseña si fue modificada
UsuarioSchema.pre("save", async function () {
  // Si la contraseña no ha sido modificada, continuar
  if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para comparar contraseñas (útil en login)
UsuarioSchema.methods.compararPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Usuario", UsuarioSchema);
