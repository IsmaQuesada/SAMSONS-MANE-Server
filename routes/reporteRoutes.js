//Express para agregar las rutas
const express = require("express");
const router = express.Router();

//Videojuego controller para los métodos definidos
const reporteController = require("../controllers/reporteController");

//Definición de rutas para generos
/* router.get("/vj-genero/", reporteController.getVideojuegoByGenero);

router.get("/vj-mes/", reporteController.getVideojuegobyMes); */
router.get("/masVendidos/:id", reporteController.masVendidosSucursal);

// Definir la ruta para contar reservas por estado
router.get('/reservas-por-estado', reporteController.countReservasPorEstado);

module.exports = router;