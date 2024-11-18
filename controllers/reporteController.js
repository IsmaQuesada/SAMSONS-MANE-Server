const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

module.exports.masVendidosSucursal = async (request, response, next) => {
    try {
        const idSucursal = parseInt(request.params.id);
        console.log("ID de sucursal recibido:", idSucursal);  // Añadir esto para verificar el valor recibido
        
        if (isNaN(idSucursal)) {
            console.log("ID de sucursal no válido");  // Mensaje para depuración
            return response.status(400).json({ error: 'ID de sucursal no válido' });
        }

  
      const result = await prisma.$queryRaw(
        Prisma.sql`SELECT * FROM (
            SELECT 
                su.nombre AS sucursal, 
                p.nombre AS producto_servicio, 
                SUM(df.cantidad) AS cantidad_vendida 
            FROM 
                factura f
            JOIN 
                detallefactura df ON f.id = df.factura_id
            LEFT JOIN 
                producto p ON df.producto_id = p.id
            LEFT JOIN 
                sucursal su ON f.sucursal_id = su.id
            WHERE 
                f.estado = 1 
                AND f.sucursal_id = ${idSucursal}
                AND df.producto_id IS NOT NULL -- Solo productos
            GROUP BY 
                su.nombre, p.nombre 
            ORDER BY 
                cantidad_vendida DESC 
            LIMIT 1
        ) AS productos_mas_vendidos
  
        UNION ALL
  
        -- Servicio más vendido
        SELECT * FROM (
            SELECT 
                su.nombre AS sucursal, 
                s.nombre AS producto_servicio, 
                SUM(df.cantidad) AS cantidad_vendida 
            FROM 
                factura f
            JOIN 
                detallefactura df ON f.id = df.factura_id
            LEFT JOIN 
                servicio s ON df.servicio_id = s.id
            LEFT JOIN 
                sucursal su ON f.sucursal_id = su.id
            WHERE 
                f.estado = 1 
                AND f.sucursal_id = ${idSucursal}
                AND df.servicio_id IS NOT NULL -- Solo servicios
            GROUP BY 
                su.nombre, s.nombre 
            ORDER BY 
                cantidad_vendida DESC 
            LIMIT 1
        ) AS servicios_mas_vendidos;`
      );
  
      response.json(result);
    } catch (error) {
      next(error); // Manejo de errores centralizado
    }
  };

  module.exports.countReservasPorEstado = async (req, res, next) => {
    try {
      // Ejecutar consulta usando Prisma
      const reservasPorEstado = await prisma.reserva.groupBy({
        by: ['estado'],
        _count: {
          id: true,
        },
      });
  
      // Responder con los datos
      res.json(reservasPorEstado);
    } catch (error) {
      next(error); // Manejo de errores centralizado
    }
  };