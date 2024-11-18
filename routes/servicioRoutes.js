const express = require('express');
const router = express.Router();
//Controlador
const ServicioController = require('../controllers/servicioTiendaController')
const auth = require("../middleware/auth");

//Rutas
//locahost:3000/producto/
router.get('/', ServicioController.get)

//Obtener un producto
router.get('/:id', ServicioController.getById)

//Crear producto
router.post('/', auth.grantRole(["ADMIN"]), ServicioController.create)
//Actualizar producto
router.put('/:id', auth.grantRole(["ADMIN"]), ServicioController.update)


module.exports = router