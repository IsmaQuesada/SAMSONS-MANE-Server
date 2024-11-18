const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

module.exports.getById = async (request, response, next) => {
    try {
        //Parametro: id
        let horarioId = parseInt(request.params.id)
        const horario = await prisma.horario.findUnique({
            where: {
                id: horarioId
            },
            include: {
                sucursal: true
            }
        });

        if (!horario) {
            throw new Error('Horario no encontrado');
        }

        response.json(horario)
    } catch (error) {
        console.error('Error fetching horario:', error);
        throw error;
    }
}
// Crear Horario
module.exports.create = async (request, response, next) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { sucursales, dias, fecha, horaInicio, horaFin } = request.body;

        // Crear objetos Date para fecha, horaInicio y horaFin
        const fechaISO = new Date(`${fecha}T00:00:00.000Z`); // Fecha sin hora
        const horaInicioISO = new Date(horaInicio); // Hora de inicio en formato ISO-8601
        const horaFinISO = new Date(horaFin); // Hora de fin en formato ISO-8601

        // Crear un nuevo horario en la base de datos
        const newHorario = await prisma.horario.create({
            data: {
                sucursal: {
                    connect: { id: sucursales } // Conectar con una sucursal existente
                },
                dia_semana: dias,
                fecha: fechaISO, // Fecha sin hora
                hora_inicio: horaInicioISO, // Hora de inicio en formato Date
                hora_fin: horaFinISO, // Hora de fin en formato Date
            },
        });

        response.json(newHorario);
    } catch (error) {
        console.error('Error al crear el horario', error);
        response.status(500).json({ error: 'Error al crear el horario' });
    }
};
