const { PrismaClient } = require('@prisma/client');
const { connect } = require('http2');
const prisma = new PrismaClient();
const { Role } = require("@prisma/client");
const jwt = require("jsonwebtoken");
//npm install bcrypt
const bcrypt = require("bcrypt");

//Obtener listado
module.exports.get = async (request, response, next) => {
    const listado = await prisma.usuario.findMany({
        where: { role: 'ENCARGADO' },
        orderBy: {
            nombre: 'asc'
        }
    })
    response.json(listado)
};

module.exports.getById = async (request, response, next) => {
    try {
        // Parámetro: id
        const idUsuario = parseInt(request.params.id);

        // Buscar al usuario por id
        const usuario = await prisma.usuario.findUnique({
            where: { id: idUsuario },
            include: {
                sucursal: true, // Incluir la sucursal si existe
            },
        });

        // Verificar si el usuario existe
        if (!usuario) {
            return response.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Enviar el usuario encontrado
        response.json(usuario);
    } catch (error) {
        // Manejo de errores
        console.error('Error al obtener usuario:', error);
        response.status(500).json({ error: 'Error interno del servidor' });
    }
};


// UsuarioController.js
//Obtener los clientes
module.exports.getClientes = async (request, response, next) => {
    try {
        let clientes =
            await prisma.usuario.findMany({
                where: {
                    role: "CLIENT",
                },
            });
        response.json(clientes);
    } catch (error) {
        next(error);
    }
};

module.exports.getUsuarios = async (request, response, next) => {
    try {
        let usuarios =
            await prisma.usuario.findMany({
                orderBy: {
                    id: 'asc'
                }
            });
        response.json(usuarios);
    } catch (error) {
        next(error);
    }
};

//Crear nuevo usuario
module.exports.register = async (request, response, next) => {
    const userData = request.body;

    //Salt es una cadena aleatoria.
    //"salt round" factor de costo controla cuánto tiempo se necesita para calcular un solo hash de BCrypt
    // salt es un valor aleatorio y debe ser diferente para cada cálculo, por lo que el resultado casi nunca debe ser el mismo, incluso para contraseñas iguales
    let salt = bcrypt.genSaltSync(10);
    // Hash password
    let hash = bcrypt.hashSync(userData.password, salt);

    const fechaUTC = new Date(userData.fecha);
    const offset = -6; // GMT-6 para Costa Rica
    const fechaCR = new Date(
        fechaUTC.setHours(fechaUTC.getHours() + offset)
    );

    const user = await prisma.usuario.create({
        data: {
            nombre: userData.nombre,
            email: userData.email,
            password: hash,
            role: userData.rol,
            fechaNacimiento: fechaCR,
            telefono: userData.tel.toString(),
        },
    });

    response.status(200).json({
        status: true,
        message: "Usuario creado",
        data: user,
    });
};


module.exports.login = async (request, response, next) => {
    let userReq = request.body;
    //Buscar el usuario según el email dado
    const user = await prisma.usuario.findUnique({
        where: {
            email: userReq.email,
        },
    });
    //Sino lo encuentra según su email
    if (!user) {
        response.status(401).send({
            success: false,
            message: "Usuario no registrado",
        });
    }
    //Verifica la contraseña
    const checkPassword = await bcrypt.compare(userReq.password, user.password);
    if (checkPassword === false) {
        response.status(401).send({
            success: false,
            message: "Credenciales no validas"
        })
    } else {
        //Usuario correcto
        //Crear el payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        //Crear el token
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        });
        response.json({
            success: true,
            message: "Usuario registrado",
            token,

        })
    }
};

module.exports.update = async (request, response, next) => {
    let body = request.body;
    let updateUsuario;
    let idUsuario = parseInt(body.id);

    const fechaUTC = new Date(body.fecha);
    const offset = -6; // GMT-6 para Costa Rica
    const fechaCR = new Date(
        fechaUTC.setHours(fechaUTC.getHours() + offset)
    );


    if (body.password.trim() !== '') {
        let salt = bcrypt.genSaltSync(10);
        // Hash password
        let hash = bcrypt.hashSync(body.password, salt);

        updateUsuario = await prisma.usuario.update({
            where: {
                id: idUsuario,
            },
            data: {
                nombre: body.nombre,
                email: body.email,
                password: hash,
                role: body.role,
                fechaNacimiento: fechaCR,
                telefono: body.tel.toString(),
            },
        });

    } else {
        updateUsuario = await prisma.usuario.update({
            where: {
                id: idUsuario,
            },
            data: {
                nombre: body.nombre,
                email: body.email,
                role: body.role,
                fechaNacimiento: fechaCR,
                telefono: body.tel.toString(),
            },
        });
    }

    response.json(updateUsuario);
};
