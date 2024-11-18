const { PrismaClient, Estado } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

module.exports.create = async (request, response, next) => {
    let body = request.body;

    try {
        // Crear la factura
        const newFactura = await prisma.factura.create({
            data: {
                fecha: body.fecha,
                cliente_id: body.selectedClient.id,
                sucursal_id: body.selectedHorario.sucursal_id,
                Total: body.selectedService.tarifa,
                estado: false, // Estado inicial de la factura
            }
        });

        // Crear el detalle de la factura
        const detalleData = {
            factura_id: newFactura.id, // Utiliza el id generado para la nueva factura
            servicio_id: body.selectedService.id,
            cantidad: 1, // Valor fijo de cantidad
            precio: body.selectedService.tarifa,
            subTotal: body.selectedService.tarifa
        };

        await prisma.detalleFactura.create({
            data: detalleData
        });

        // Obtener la última reserva creada
        const ultimaReserva = await prisma.reserva.findFirst({
            orderBy: {
                id: 'desc' // Ordenar en orden descendente por id
            }
        });

        if (ultimaReserva) {
            // Actualizar la última reserva con el id de la factura recién creada
            await prisma.reserva.update({
                where: {
                    id: ultimaReserva.id // Usar el id de la última reserva
                },
                data: {
                    facturaId: newFactura.id // Actualiza el campo `facturaId` en la reserva
                }
            });
        } else {
            console.error('No se encontró ninguna reserva para actualizar');
        }

        // Retornar la nueva factura con su id
        response.json({ id: newFactura.id });
    } catch (error) {
        console.error('Error al crear la factura o el detalle:', error);
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};



//Actualiza el estado de la factura
module.exports.update = async (request, response, next) => {
    let body = request.body;
    let idFactura = parseInt(request.params.id);

    try {
        console.log(`ID recibido: ${request.params.id}`);
        // Obtener la factura para verificar si existe
        const facturaVieja = await prisma.factura.findUnique({
            where: { id: idFactura },
        });

        if (!facturaVieja) {
            return response.status(404).json({ error: "Factura no encontrada" });
        }

        // Actualizar el estado de la factura
        const updatedFactura = await prisma.factura.update({
            where: {
                id: idFactura,
            },
            data: {
                estado: 1, // Asumiendo que 1 representa "factura"
            },
        });

        // Obtener la reserva asociada a la factura
        const reserva = await prisma.reserva.findUnique({
            where: { facturaId: idFactura },
        });

        if (reserva) {
            // Actualizar el estado de la reserva a "CONFIRMADA"
            await prisma.reserva.update({
                where: { id: idFactura },
                data: { estado: 'CONFIRMADA' },
            });
        }

        // Obtener la factura actualizada con todos los detalles
        const facturaActualizada = await prisma.factura.findUnique({
            where: { id: idFactura },
            include: {
                cliente: true, // Asegúrate de que los modelos están bien definidos en tu schema.prisma
                sucursal: true,
                detalleFacturas: {
                    include: {
                        servicio: true, // Incluye detalles del servicio
                        producto: true  // Incluye detalles del producto
                    }
                }
            }
        });

        response.json(facturaActualizada);

    } catch (error) {
        console.error("Error al actualizar la factura:", error);
        response.status(500).json({ error: "Error interno del servidor" });
    }
};
