const express = require('express');
const router = express.Router();
//Controlador
const detalleFacturaController = require('../controllers/detalleFacturaController');
//Rutas
//locahost:3000/factura/
router.get('/:id', detalleFacturaController.getById)

module.exports = router