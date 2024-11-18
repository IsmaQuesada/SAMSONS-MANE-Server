
const express = require('express');
const router = express.Router();
//Controlador
const bloqueoController = require('../controllers/bloqueoController')

router.get('/', bloqueoController.get)

//Obtener un bloqueo
router.get('/:id', bloqueoController.getById)

router.post('/', bloqueoController.create)

module.exports = router