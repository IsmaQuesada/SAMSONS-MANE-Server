const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

module.exports.getById = async (request, response, next) => {
    const { id } = request.params;

    try {
        const factura = await prisma.detalleFactura.findMany({
            where: {
                factura_id: parseInt(id),
            },
            include: {
                servicio: true,
                producto: true,
                factura: true
            }
        });

        if (!factura) {
            return response.status(404).json({ message: 'Factura no encontrada' });
        }

        response.json(factura);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};