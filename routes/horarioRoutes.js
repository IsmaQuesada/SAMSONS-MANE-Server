const express = require('express');
const router = express.Router();
//Controlador
const horarioController = require('../controllers/horarioController')
const auth = require("../middleware/auth");

//Obtener un producto
router.get('/:id', horarioController.getById)

//Crear horario
router.post('/', auth.grantRole(["ADMIN", "ENCARGADO"]), horarioController.create)

module.exports = router