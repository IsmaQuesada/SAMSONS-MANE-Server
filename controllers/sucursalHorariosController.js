const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

module.exports.getHorarios = async (request, response, next) => {
    try {
        const listado = await prisma.sucursal.findMany({
            where: {
                OR: [
                    {
                        horarios: {
                            some: {}
                        }
                    },
                    {
                        DiasBloqueados: {
                            some: {}
                        }
                    }
                ]
            },
            include: {
                horarios: true,
                DiasBloqueados: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
        response.json(listado);
    } catch (error) {
        next(error);
    }
};

module.exports.getById = async (request, response, next) => {
    try {
        // Obtener el ID de la sucursal desde los parámetros de la solicitud
        const sucursalId = parseInt(request.params.id);

        // Obtener la sucursal con sus horarios y días bloqueados
        const sucursal = await prisma.sucursal.findUnique({
            where: {
                id: sucursalId
            },
            include: {
                horarios: true,
                DiasBloqueados: true
            }
        });

        // Verificar si la sucursal existe
        if (!sucursal) {
            return response.status(404).json({ error: 'Sucursal no encontrada' });
        }

        // Enviar la respuesta con los datos de la sucursal, horarios y días bloqueados
        response.json(sucursal);
    } catch (error) {
        console.error('Error al obtener la sucursal:', error);
        next(error); // Pasar el error al manejador de errores de Express
    }
};