const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

module.exports.get = async (request, response, next) => {
    try {
        // Obtén el parámetro de la solicitud, si es necesario
        // const sucursalId = parseInt(request.params.sucursalId);

        // Elimina la validación y el filtro por sucursalId
        const bloqueos = await prisma.diasBloqueados.findMany();

        if (bloqueos.length === 0) {
            return response.status(404).json({ error: 'No hay bloqueos disponibles' });
        }

        response.json(bloqueos);
    } catch (error) {
        console.error('Error fetching bloqueos:', error);
        response.status(500).json({ error: error.message });
    }
};

module.exports.getById = async (request, response, next) => {
    try {
        //Parametro: id
        let bloqueoId = parseInt(request.params.id)
        const bloqueo = await prisma.diasBloqueados.findUnique({
            where: {
                id: bloqueoId
            },
            include: {
                sucursal: true
            }
        });

        if (!bloqueo) {
            throw new Error('bloqueo no encontrado');
        }

        response.json(bloqueo)
    } catch (error) {
        console.error('Error fetching bloqueo:', error);
        throw error;
    }
}

module.exports.create = async (request, response, next) => {
    try {
        const { sucursales, dias, fecha, horaInicio, horaFin } = request.body;
        // Crear objetos Date para fecha, horaInicio y horaFin
        const fechaISO = new Date(`${fecha}T00:00:00.000Z`); // Fecha sin hora
        const horaInicioISO = new Date(horaInicio); // Hora de inicio en formato ISO-8601
        const horaFinISO = new Date(horaFin); // Hora de fin en formato ISO-8601

        const newBloqueo = await prisma.diasBloqueados.create({
            data: {
                sucursal: {
                    connect: { id: sucursales } // Conectar con una sucursal existente
                },
                dia_semana: dias,
                fecha: fechaISO, // Fecha sin hora
                hora_inicio: horaInicioISO, // Hora de inicio en formato Date
                hora_fin: horaFinISO, // Hora de fin en formato Date
            },
        })

        response.json(newBloqueo)
    } catch (error) {
        console.error('Error al crear el horario', error);
        response.status(500).json({ error: 'Error al crear el horario' });
    }
}