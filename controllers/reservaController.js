const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');

const prisma = new PrismaClient();

// Obtener listado de las reservas
module.exports.get = async (request, response, next) => {
    try {
        const listado = await prisma.reserva.findMany({
            include: {
                cliente: {
                    select: {
                        nombre: true
                    }
                },
                //sucursal: true
            },
            orderBy: {
                fecha: 'desc'
            }
        });
        response.json(listado);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};

//Obtener Reserva
// Obtener Reserva
module.exports.getById = async (request, response, next) => {
    try {
        let idReserva = parseInt(request.params.id);
        console.log(idReserva);
        let reserva = await prisma.reserva.findUnique({
            where: {
                id: idReserva,  // El ID ya está asegurado de ser un entero
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        // agrega otros campos del cliente que necesites
                    }
                },
                sucursal: {
                    select: {
                        id: true,
                        nombre: true,
                        direccion: true,
                        email: true,
                        telefono: true,
                        encargados: {
                            where: {
                                role: 'ENCARGADO' // Asegúrate de que el campo se llame 'role'
                            },
                            select: {
                                id: true,
                                nombre: true,
                                email: true,
                                // agrega otros campos del encargado que necesites
                            }
                        }
                    }
                },
                servicio: true,
                factura: true
            },
        });

        if (!reserva) {
            return response.status(404).json({ message: 'Reserva no encontrada' });
        }

        response.json(reserva);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};

// Obtener listado de las reservas por cliente
module.exports.getByCliente = async (request, response, next) => {
    try {
        const nombreCliente = request.params.nombre;

        // Busca clientes cuyo nombre contenga la cadena de búsqueda
        const clientes = await prisma.usuario.findMany({
            where: {
                nombre: {
                    contains: nombreCliente, // Búsqueda de coincidencias parciales
                    // No se usa 'mode' si no es compatible
                }
            }
        });

        // Obtener reservas asociadas a cada cliente encontrado
        const listado = await prisma.reserva.findMany({
            where: {
                clienteId: {
                    in: clientes.map(cliente => cliente.id) // Obtener IDs de los clientes encontrados
                }
            },
            include: {
                cliente: {
                    select: {
                        nombre: true
                    }
                }
                // Puedes incluir otros campos si es necesario
            },
            orderBy: {
                fecha: 'desc'
            }
        });

        response.json(listado);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};


// Obtener listado de las reservas por fecha
module.exports.getByFecha = async (request, response, next) => {
    try {
        const fecha = request.params.fecha;
        const fechaInicio = new Date(fecha);
        // Para buscar por una fecha específica, usa `gte` y `lt` para la búsqueda exacta
        const fechaFin = new Date(fechaInicio);
        console.log("Fecha");
        console.log(fechaFin);
        fechaFin.setDate(fechaFin.getDate() + 1); // Final del día

        const listado = await prisma.reserva.findMany({
            where: {
                fecha: {
                    gte: fechaInicio,
                    lt: fechaFin // Menor que el siguiente día para obtener sólo el día especificado
                }
            },
            include: {
                cliente: {
                    select: {
                        nombre: true
                    }
                }
                // Puedes incluir otros campos si es necesario
            },
            orderBy: {
                fecha: 'desc'
            }
        });

        response.json(listado);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};

//Crear
module.exports.create = async (request, response, next) => {
    let body = request.body
    const newReserva = await prisma.reserva.create({
        data: {
            fecha: body.fecha,
            hora: body.hora,
            estado: body.estado,
            clienteId: body.clienteId,
            sucursalId: body.sucursalId,
            TipoCorte: body.TipoCorte,
            //[{id:valor},{id:valor}]
            alergias: body.alergias,
            preferenciaProductos: body.preferenciaProductos,
        }
    })
    response.json(newReserva)
};


//Actualiza falta
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

module.exports.getAvailableHours = async (request, response, next) => {
    try {
        const { sucursalId, fecha } = request.params;

        // Crear las fechas de inicio y fin del día en formato UTC
        const fechaInicio = new Date(`${fecha}T00:00:00Z`);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 1); // Final del día

        // Obtener los horarios disponibles para la sucursal y fecha especificada
        const horarios = await prisma.horario.findMany({
            where: {
                sucursal_id: Number(sucursalId),
                fecha: {
                    gte: fechaInicio,
                    lt: fechaFin
                }
            }
        });

        // Obtener las reservas para la sucursal y fecha especificada
        const reservas = await prisma.reserva.findMany({
            where: {
                sucursalId: Number(sucursalId),
                fecha: {
                    gte: fechaInicio,
                    lt: fechaFin
                }
            }
        });

        // Obtener los bloqueos para la sucursal y fecha especificada
        const bloqueos = await prisma.diasBloqueados.findMany({
            where: {
                sucursal_id: Number(sucursalId),
                fecha: {
                    gte: fechaInicio,
                    lt: fechaFin
                }
            }
        });

        // Filtrar los horarios para eliminar los que están reservados o bloqueados
        const horariosDisponibles = horarios.filter(horario => {
            const isReserved = reservas.some(reserva => {
                // Convertir la hora de reserva a formato de hora
                const reservaHora = new Date(`1970-01-01T${reserva.hora}:00Z`);
                const horarioInicio = new Date(`1970-01-01T${horario.hora_inicio.toISOString().substring(11, 16)}:00Z`);
                const horarioFin = new Date(`1970-01-01T${horario.hora_fin.toISOString().substring(11, 16)}:00Z`);

                return reserva.fecha.toISOString().split('T')[0] === horario.fecha.toISOString().split('T')[0] &&
                    reservaHora >= horarioInicio &&
                    reservaHora < horarioFin;
            });

            const isBlocked = bloqueos.some(bloqueo => {
                // Convertir las horas de bloqueo a formato de hora
                const bloqueoInicio = new Date(`1970-01-01T${bloqueo.hora_inicio.toISOString().substring(11, 16)}:00Z`);
                const bloqueoFin = new Date(`1970-01-01T${bloqueo.hora_fin.toISOString().substring(11, 16)}:00Z`);
                const horarioInicio = new Date(`1970-01-01T${horario.hora_inicio.toISOString().substring(11, 16)}:00Z`);
                const horarioFin = new Date(`1970-01-01T${horario.hora_fin.toISOString().substring(11, 16)}:00Z`);

                return bloqueo.fecha.toISOString().split('T')[0] === horario.fecha.toISOString().split('T')[0] &&
                    (bloqueoInicio <= horarioInicio && horarioInicio < bloqueoFin) ||
                    (bloqueoInicio < horarioFin && horarioFin <= bloqueoFin);
            });

            return !isReserved && !isBlocked;
        });

        response.json(horariosDisponibles);
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect();
    }
};

module.exports.create = async (request, response, next) => {
    let body = request.body;
    try {
        // Crear una nueva reserva usando los datos enviados
        const newReserva = await prisma.reserva.create({
            data: {
                fecha: body.fecha,
                hora: body.selectedHoraLlegada,  // Suponiendo que "hora" se refiere a la hora de llegada
                estado: body.estado,  // Usar el estado que se ha enviado
                clienteId: body.selectedClient.id,  // Extraer el id del cliente
                sucursalId: body.selectedHorario.sucursal_id,  // Usar el sucursal_id del horario seleccionado
                servicioId: body.selectedService.id,  // Extraer el id del servicio
                TipoCorte: body.TipoCorte,  // El tipo de corte
                alergias: body.alergias,  // Las alergias
                preferenciaProductos: body.preferenciaProductos  // Preferencias de productos
            }
        });

        // Responder con el nuevo producto creado
        response.json(newReserva);
    } catch (error) {
        // Manejar errores
        next(error);
    }
};


