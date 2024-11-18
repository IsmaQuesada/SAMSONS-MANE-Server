const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res, next) => {
    try {
      const listado = await prisma.factura.findMany({
        include: {
          cliente: true,
          sucursal: true,
        },
        orderBy: {
          fecha: "desc",
        },
      });
      res.json(listado);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  },

  getById: async (req, res, next) => {
    const { id } = req.params;

    try {
      const factura = await prisma.factura.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          cliente: true,
          sucursal: true,
          detalleFacturas: {
            where: {
              factura_id: parseInt(id),
            },
            include: {
              producto: true,
              servicio: true,
            },
          },
        },
      });

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      res.json(factura);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  },

  create: async (req, res, next) => {
    const { fechaFactura, detalles, sucursal, cliente, total } = req.body;

    try {
      // Convertir la fecha y hora recibida en UTC a la zona horaria local (GMT-6)
      const fechaFacturaUTC = new Date(fechaFactura);

      // Ajustar la fecha a GMT-6
      const offset = -6; // GMT-6 para Costa Rica
      const fechaFacturaCR = new Date(
        fechaFacturaUTC.setHours(fechaFacturaUTC.getHours() + offset)
      );

      // Crear la factura en la base de datos
      const factura = await prisma.factura.create({
        data: {
          fecha: fechaFacturaCR,
          cliente_id: cliente,
          sucursal_id: sucursal,
          Total: total,
          estado: false,
        },
      });

      // Crear los detalles de la factura
      const detalleFacturas = detalles.map((detalle) => ({
        factura_id: factura.id,
        producto_id: detalle.productoId,
        servicio_id: detalle.servicioId,
        cantidad: detalle.cantidad,
        precio: detalle.precio,
        impuesto: detalle.impuesto,
        subTotal: detalle.subtotal,
      }));

      await prisma.detalleFactura.createMany({
        data: detalleFacturas,
      });

      res.status(201).json({
        message: "Factura creada exitosamente",
        facturaId: factura.id,
      });
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  },

  updateEstado: async (req, res, next) => {
    const { id } = req.params; // ID de la factura a actualizar
    const { detalles, Total } = req.body; // Los detalles de la factura y el total

    try {
      // Convertir ID a entero
      const idFactura = parseInt(id);

      // Actualizar el estado y el total de la factura
      const factura = await prisma.factura.update({
        where: {
          id: idFactura,
        },
        data: {
          estado: true, // Cambia el estado según tus necesidades
          Total: Total, // Actualizar el total de la factura
        },
      });

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      // Eliminar los detalles actuales de la factura si necesitas reemplazarlos
      await prisma.detalleFactura.deleteMany({
        where: { factura_id: idFactura },
      });

      // Crear los nuevos detalles de la factura
      const detalleFacturas = detalles.map((detalle) => ({
        factura_id: idFactura,
        producto_id: detalle.producto_id,
        servicio_id: detalle.servicio_id,
        cantidad: detalle.cantidad,
        precio: detalle.precio,
        impuesto: detalle.impuesto,
        subTotal: detalle.subTotal,
      }));

      // Insertar los nuevos detalles
      await prisma.detalleFactura.createMany({
        data: detalleFacturas,
      });

      // Obtener la reserva asociada a la factura
      const reserva = await prisma.reserva.findFirst({
        where: { facturaId: idFactura },
      });

      if (reserva) {
        // Actualizar el estado de la reserva a "CONFIRMADA"
        await prisma.reserva.update({
          where: { id: reserva.id }, // Usar el ID de la reserva
          data: { estado: 'CONFIRMADA' },
        });
      }

      res.json(factura);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  },
}