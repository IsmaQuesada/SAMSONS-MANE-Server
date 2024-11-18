//Express para agregar las rutas
const express = require("express");
const router = express.Router();

const controller = require("../controllers/fileController");

  router.post("/upload", controller.upload);
  router.get("/files", controller.getListFiles);
  router.get("/files/:name", controller.download);

  module.exports = router;
