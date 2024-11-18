const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports.get = async (request, response, next) => {
    let listRoles = [];
    for (let element in Role) {
        switch (element) {
            case Role.ADMIN:
                listRoles.unshift({
                    ["id"]: element,
                    ["nombre"]: "Administrador",
                });
                break;
            case Role.CLIENT:
                listRoles.unshift({
                    ["id"]: element,
                    ["nombre"]: "Cliente",
                });
                break;
            case Role.ENCARGADO:
                listRoles.unshift({
                    ["id"]: element,
                    ["nombre"]: "Encargado",
                });
                break;
            default:
                listRoles.unshift({ ["id"]: Role.USER, ["nombre"]: "Usuario" });
                break;
        }
    }

    response.json(listRoles);
};
module.exports.getById = async (request, response, next) => {
    let id = request.params.id;
    let nombre = "";
    switch (Role[id]) {
        case Role.ADMIN:
            nombre = "Administrador";
            break;
        case Role.CLIENT:
            nombre = "Cliente";
            break;
        case Role.ENCARGADO:
            nombre = "Encargado";
            break;
        default:
            nombre = "Usuario";
            break;
    }

    let rol = { ["id"]: Role[id], ["nombre"]: nombre };
    response.json(rol);
};
