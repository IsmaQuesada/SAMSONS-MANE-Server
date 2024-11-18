const express = require('express');
const router = express.Router();
//Controlador
const proformaReservaController = require('../controllers/proformaReservaController');
//Crear factura
router.post('/', proformaReservaController.create)

//Actualizar factura
router.put('/:id', proformaReservaController.update) 

module.exports = router