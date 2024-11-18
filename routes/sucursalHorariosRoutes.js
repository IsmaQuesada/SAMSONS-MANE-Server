const express = require('express');
const router = express.Router();
//Controlador
const sucursalHorariosController = require('../controllers/sucursalHorariosController')

router.get('/', sucursalHorariosController.getHorarios)

router.get('/:id', sucursalHorariosController.getById)

module.exports = router