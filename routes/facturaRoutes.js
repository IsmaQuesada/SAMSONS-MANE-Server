const express = require('express');
const router = express.Router();
// Controlador
const FacturaController = require('../controllers/facturaController'); // Asegúrate de que esta ruta sea correcta
const auth = require("../middleware/auth");
// Rutas

// Obtener listado de facturas
router.get('/', FacturaController.get);

// Obtener una factura por ID
router.get('/:id', FacturaController.getById);

// Crear una nueva factura
router.post('/', auth.grantRole(["ADMIN", "ENCARGADO"]), FacturaController.create); // Asegúrate de que `create` esté definido en FacturaController

//actualizar
router.put('/:id', auth.grantRole(["ADMIN", "ENCARGADO"]), FacturaController.updateEstado)


module.exports = router;
