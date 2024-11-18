const express = require('express');
const router = express.Router();
//Controlador
const SucursalController = require('../controllers/sucursalController')
const auth = require("../middleware/auth");

//Rutas
//locahost:3000/sucursal/
router.get('/', SucursalController.get)

//Obtener un producto
router.get('/:id', SucursalController.getById)

//Crear producto
router.post('/', auth.grantRole(["ADMIN"]), SucursalController.create)

//Actualizar producto
router.put('/:id', auth.grantRole(["ADMIN"]), SucursalController.update)

module.exports = router