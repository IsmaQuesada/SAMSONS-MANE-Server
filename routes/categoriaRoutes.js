const express=require("express")
const router=express.Router();

//Controlador
const CategoriaController=require("../Controllers/categoriaControllers")

//Rutas
router.get("/",CategoriaController.get)

module.exports=router