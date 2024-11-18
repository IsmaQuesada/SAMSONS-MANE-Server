const { PrismaClient, Prisma } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

//Obtener listado
module.exports.get = async (request, response, next) => {
  const listado = await prisma.producto.findMany({
    orderBy: {
      nombre: 'asc',
    },
    include: {
      categoria: true,
    }
  })
  response.json(listado)
};
//Obtener por Id
//localhost:3000/producto/3
module.exports.getById = async (request, response, next) => {
  //Parametro: id
  let idProducto = parseInt(request.params.id)
  const objProducto = await prisma.producto.findFirst({
    where: { id: idProducto },
    include: {
      categoria: true,
    }
  })

  response.json(objProducto)
};
//Crear
module.exports.create = async (request, response, next) => {
  let body = request.body
  const newProducto = await prisma.producto.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      marca: body.marca,
      uso: body.uso,
      imagen: body.imagen,
      //[{id:valor},{id:valor}]
      categoria_id: body.categoria_id,


    }
  })
  response.json(newProducto)
};
//Actualiza
module.exports.update = async (request, response, next) => {
  let body = request.body;
  let idProducto = parseInt(request.params.id);

  // Obtener producto viejo
  const productoViejo = await prisma.producto.findUnique({
    where: { id: idProducto },
    include: {
      categoria: {
        select: {
          id: true
        }
      },
    }
  });

  // Formatear la categoría correctamente
  let categoriaData = body.categoria_id ? { id: body.categoria_id } : null;

  const updateProducto = await prisma.producto.update({
    where: {
      id: idProducto,
    },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: body.precio,
      marca: body.marca,
      uso: body.uso,
      categoria_id: body.categoria_id,
    },
  });

  response.json(updateProducto);
};

module.exports.getTopVentas = async (request, response, next) => {
  try {
    const productosMasVendidos = await prisma.detalleFactura.groupBy({
      by: ['producto_id'],
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      where: {
        producto_id: {
          not: null, // Excluir servicios y asegurarse de que solo se incluyan productos
        },
      },
    });

    const productosConDetalles = await Promise.all(
      productosMasVendidos.map(async (detalle) => {
        const producto = await prisma.producto.findUnique({
          where: {
            id: detalle.producto_id,
          },
          include: {
            categoria: true,
          },
        });
        return {
          ...producto,
          cantidadVendida: detalle._sum.cantidad,
        };
      })
    );

    response.json(productosConDetalles);
  } catch (error) {
    next(error);
  }
};