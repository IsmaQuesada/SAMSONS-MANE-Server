const express = require('express');
const router = express.Router();
//Controlador
const UsuarioController = require('../controllers/usuarioController');
const auth = require("../middleware/auth");

//Rutas
//locahost:3000/sucursal/
router.get('/', UsuarioController.get)

router.get('/getClientes', UsuarioController.getClientes)

router.get('/getUsuarios', UsuarioController.getUsuarios)

router.get('/:id', UsuarioController.getById)

router.post("/login", UsuarioController.login);

router.post("/registrar", UsuarioController.register);

//Actualizar producto
router.put('/:id', auth.grantRole(["ADMIN"]), UsuarioController.update)

module.exports = router