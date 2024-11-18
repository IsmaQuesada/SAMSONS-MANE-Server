const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();
//Obtener listado
module.exports.get = async (request, response, next) => {
  const listado = await prisma.sucursal.findMany({
    orderBy: {
      nombre: 'asc'
    }
  })
  response.json(listado)
};

module.exports.getById = async (request, response, next) => {
  //Parametro: id
  let idSucuraL = parseInt(request.params.id)
  const objSucursal = await prisma.sucursal.findFirst({
    where: { id: idSucuraL },
    include: {
      encargados: {
        where: {
          role: 'ENCARGADO'
        }
      }

    }
  })

  response.json(objSucursal)
};

//crear
module.exports.create = async (request, response, next) => {
  try {
    let body = request.body;

    // Inicia una transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Crear la nueva sucursal
      const newSucursal = await prisma.sucursal.create({
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          telefono: body.telefono,
          direccion: body.direccion,
          email: body.email,
        },
      });

      // Actualizar el usuario encargado con el ID de la nueva sucursal
      const updatedUsuario = await prisma.usuario.update({
        where: { id: body.encargadoId },
        data: {
          sucursalId: newSucursal.id,
        },
      });

      return { newSucursal, updatedUsuario };
    });

    // Retornar la respuesta con los datos de la nueva sucursal y el usuario actualizado
    response.json(result.newSucursal);
  } catch (error) {
    console.error('Error al crear la sucursal y actualizar el usuario', error);
    response.status(500).json({ error: 'Error al crear la sucursal y actualizar el usuario' });
  }
};


//Actualizar
module.exports.update = async (request, response, next) => {
  let body = request.body;
  let idSucursal = parseInt(request.params.id);

  try {
    // Obtener la sucursal actual
    const sucursalViejo = await prisma.sucursal.findUnique({
      where: { id: idSucursal },
    });

    // Obtener el encargado viejo (si existe)
    const encargadoViejo = await prisma.usuario.findFirst({
      where: {
        sucursalId: idSucursal,
        role: 'ENCARGADO'
      }
    });

    // Actualizar la sucursal
    const updateServicio = await prisma.sucursal.update({
      where: {
        id: idSucursal,
      },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        telefono: body.telefono,
        direccion: body.direccion,
        email: body.email,
      },
    });

    // Desasociar el encargado viejo si existe
    if (encargadoViejo) {
      await prisma.usuario.update({
        where: { id: encargadoViejo.id },
        data: { sucursalId: null }
      });
    }

    // Asignar el nuevo encargado si se especifica en el body
    if (body.encargadoArray && body.encargadoArray.length > 0) {
      const nuevoEncargadoId = body.encargadoArray[0].id;
      await prisma.usuario.update({
        where: { id: nuevoEncargadoId },
        data: { sucursalId: idSucursal }
      });
    }

    response.json(updateServicio);
  } catch (error) {
    next(error);
  }
};

