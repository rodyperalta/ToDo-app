const express = require("express");
const router = express.Router();
const Tarea = require("../models/Tarea");
const { proteger } = require("../middlewares/authMiddleware");

// Todas las rutas de tareas requieren autenticación
router.use(proteger); // Esto aplica el middleware a TODAS las rutas debajo

router.get("/", async (req, res) => {
  try {
    const tareas = await Tarea.find({ usuario: req.usuario.id });
    res.json(tareas);
  } catch (error) {
    res.status(500).json("No se pudieron obtener las tareas: " + error.message);
  }
});

router.post("/", async (req, res) => {
  const tarea = new Tarea({
    titulo: req.body.titulo,
    usuario: req.usuario.id,
  });
  try {
    const nuevaTarea = await tarea.save();
    res.json(nuevaTarea);
  } catch (error) {
    res.status(400).json("No se puedo crear la tarea: " + error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    // Verificar que la tarea pertenezca al usuario
    if (tarea.usuario.toString() !== req.usuario.id) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    // Actualizar
    tarea.titulo = req.body.titulo || tarea.titulo;
    tarea.completada =
      req.body.completada !== undefined
        ? req.body.completada
        : tarea.completada;
    const tareaActualizada = await tarea.save();
    res.json(tareaActualizada);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "No se pudo actualizar la tarea: " + error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    if (tarea.usuario.toString() !== req.usuario.id) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }
    await tarea.deleteOne();
    res.json({ mensaje: "Tarea eliminada" });
  } catch (error) {
    res.status(404).json("No se pudo eliminar la tarea: " + error.message);
  }
});

module.exports = router;
