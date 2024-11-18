const express = require('express');
const router = express.Router();
//Controlador
const ReservaController = require('../controllers/reservaController');
//Rutas
//locahost:3000/factura/
router.get('/', ReservaController.get)

router.get('/:id', ReservaController.getById)

router.get('/byCliente/:nombre', ReservaController.getByCliente)

router.get('/byFecha/:fecha', ReservaController.getByFecha)

//consigue los horarios disponibles
router.get('/disponibles/:sucursalId/:fecha', ReservaController.getAvailableHours);

//Crear factura
router.post('/', ReservaController.create)

module.exports = router