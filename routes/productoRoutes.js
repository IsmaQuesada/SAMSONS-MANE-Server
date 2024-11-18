const express = require('express');
const router = express.Router();
//Controlador
const ProductoController = require('../controllers/productoController')
const auth = require("../middleware/auth");

router.get("/masVendidos/", ProductoController.getTopVentas);
//Rutas
//locahost:3000/producto/
router.get('/', ProductoController.get)

//Obtener un producto
router.get('/:id', ProductoController.getById)

//Crear producto
router.post('/', auth.grantRole(["ADMIN"]), ProductoController.create)
//Actualizar producto
router.put('/:id', auth.grantRole(["ADMIN"]), ProductoController.update)

module.exports = router