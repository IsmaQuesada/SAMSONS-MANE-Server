import { PrismaClient } from '@prisma/client';
import { categoriasProducto } from './seeds/categorias';
//import { usuarios } from './seeds/usuarios';
//import { plataformas } from './seeds/plataformas';

const prisma = new PrismaClient();
const main = async () => {
    try {
        //Generos - no tiene relaciones
    await prisma.categoriaProducto.createMany({
        data: categoriasProducto,
      });
    } catch (error) {
        throw error;
    }
};
main().catch((err) => {
    console.warn('Error al ejecutar el seeder:\n', err);
});