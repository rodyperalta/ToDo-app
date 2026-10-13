const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB");
  })
  .catch((err) => {
    console.log("Algo salió mal:" + err.message);
  });

// Rutas
app.use("/api/auth", require("./routes/auth.js")); // <-- nueva línea
app.use("/api/tareas", require("./routes/tareas.js"));

// Middleware de error (después de las rutas)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: "Algo salió mal:" });
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
