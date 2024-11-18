const dotEnv = require('dotenv');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { request, response } = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express();
const chalk = require('chalk')
const path = require('path')
const cron = require('node-cron');
const sendEmail = require('./mailer'); // Asegúrate de tener mailer.js configurado
const prism = new PrismaClient();

//Ruta para imagenes
global.__basedir = __dirname;

//---Archivos de rutas---
const categoriaRouter = require("./routes/categoriaRoutes")
const productoRouter = require('./routes/productoRoutes')
const facturaRouter = require('./routes/facturaRoutes')
const detalleFacturaRouter = require('./routes/detalleFacturaRoutes')
const reservaRouter = require('./routes/reservaRoutes')
const servicioRouter = require('./routes/servicioRoutes')
const fileRouter = require("./routes/fileRoutes")
const sucursalRouter = require("./routes/sucursalRoutes")
const sucursalHorariosRoutes = require("./routes/sucursalHorariosRoutes")
const horarioRoutes = require("./routes/horarioRoutes")
const bloqueoRoutes = require("./routes/bloqueoRoutes")
const usuarioRouter = require("./routes/usuarioRoutes")
const proformaRouter = require("./routes/proformaReservaRoutes")
const rolRouter = require("./routes/rolRoutes")
const reporteRouter = require("./routes/reporteRoutes")


//const ordenRouter = require("./routes/ordenRoutes")

// Acceder a la configuracion del archivo .env
dotEnv.config();
// Puero que escucha por defecto 300 o definido .env
const port = process.env.PORT || 3000;
// Middleware CORS para aceptar llamadas en el servidor
app.use(cors());
// Middleware para loggear las llamadas al servidor
app.use(logger('dev'));
// Middleware para gestionar Requests y Response json
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
//---- Definir rutas ----
app.use("/categoria/", categoriaRouter)
app.use("/producto/", productoRouter)
app.use("/factura/", facturaRouter)
app.use("/detalleFactura/", detalleFacturaRouter)
app.use("/reserva/", reservaRouter)
app.use("/servicio/", servicioRouter)
app.use("/file/", fileRouter)
app.use("/sucursal/", sucursalRouter)
app.use("/sucursalHorarios/", sucursalHorariosRoutes)
app.use("/horario/", horarioRoutes)
app.use("/bloqueo/", bloqueoRoutes)
app.use("/usuario/", usuarioRouter)
app.use("/proforma/", proformaRouter)
app.use("/rol/", rolRouter)
app.use("/reporte/", reporteRouter)

//Acceso a las imagenes
app.use("/images", express.static(path.join(path.resolve(), "/assets/uploads")));

//app.use("/orden/", ordenRouter)

// Configuración del Cron Job
//require('./cronJob'); // Asegúrate de que cronJob.js se ejecute al iniciar el servidor

// Servidor
app.listen(port, () => {
  console.log(chalk.blue(`http://localhost:${port}`));
  console.log(chalk.blue.bgRed('Presione CTRL-C para deternerlo\n'));
});
