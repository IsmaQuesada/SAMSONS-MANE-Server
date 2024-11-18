const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();
//Obtener listado
module.exports.get = async (request, response, next) => {
  const listado = await prisma.servicio.findMany({
    orderBy: {
      nombre: 'asc'
    }
  })
  response.json(listado)
};
//Obtener por Id
//localhost:3000/producto/3
module.exports.getById = async (request, response, next) => {
  //Parametro: id
  let idServicio = parseInt(request.params.id)
  const objProducto = await prisma.servicio.findFirst({
    where: { id: idServicio }
  })

  response.json(objProducto)
};
// Crear
module.exports.create = async (request, response, next) => {
  try {
    let body = request.body;
    const newServicio = await prisma.servicio.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        tarifa: body.tarifa,
        tiempoServicio: body.tiempoServicio,
        requisitosPrevios: body.requisitosPrevios,
        Precauciones: body.Precauciones
      },
    });
    response.json(newServicio);
  } catch (error) {
    console.error('Error al crear el servicioooooooo', error);
    response.status(500).json({ error: 'Error al crear el servicio' });
  }
};
//Actualizar
module.exports.update = async (request, response, next) => {
  let body = request.body;
  let idServicio = parseInt(request.params.id);
  //Obtener producto viejo
  const servicioViejo = await prisma.servicio.findUnique({
    where: { id: idServicio },
  });

  const updateServicio = await prisma.servicio.update({
    where: {
      id: idServicio,
    },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      tarifa: body.tarifa,
      tiempoServicio: body.tiempoServicio,
      requisitosPrevios: body.requisitosPrevios,
      Precauciones: body.Precauciones
    },
  });
  response.json(updateServicio);
};
