const path = require('path'); // Asegúrate de importar 'path'
const fs = require('fs');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Función para generar el PDF
function generatePDF(cita) {
  const docDefinition = {
    content: [
      { text: `Hola ${cita.cliente.nombre},`, fontSize: 15 },
      { text: `Recordatorio: Tu cita está programada para mañana a las ${cita.hora}.`, margin: [0, 0, 0, 20] },
      {
        table: {
          body: [
            ['Hora', 'Servicio', 'Sucursal'],
            [cita.hora, cita.servicio.nombre, cita.sucursal.nombre]
          ]
        }
      },
      { text: 'Gracias por su reserva. Si tiene alguna duda, por favor, contáctenos.', margin: [0, 20, 0, 0] }
    ],
    defaultStyle: {
      font: 'Roboto' // Usa fuente personalizada si es necesario
    }
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  const filePath = path.join(__dirname, `reserva-${cita.id}.pdf`);

  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer((buffer) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) return reject(err);
        resolve(filePath);
      });
    });
  });
}

module.exports = generatePDF;
