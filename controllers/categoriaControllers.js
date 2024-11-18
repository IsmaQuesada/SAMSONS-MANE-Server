const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

module.exports.get = async (request, response, next) => {
    const categoria = await prisma.categoriaProducto.findMany()
    response.json(categoria)
}