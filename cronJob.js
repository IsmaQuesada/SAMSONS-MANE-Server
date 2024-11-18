// cronJob.js
const cron = require('node-cron');
const sendEmail = require('./mailer');
const generatePDF = require('./pdfGenerator'); // Importa la función correctamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

cron.schedule('* * * * *', async () => {
  console.log('Iniciando tarea cron...');
  try {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    const citas = await prisma.reserva.findMany({
      where: {
        fecha: {
          gte: tomorrow.toISOString(),
          lt: tomorrow.add(1, 'day').toISOString()
        }
      },
      include: {
        cliente: true,
        sucursal: true,
        servicio: true
      }
    });

    if (citas.length === 0) {
      console.log('No hay citas para notificar.');
      return;
    }

    for (const cita of citas) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: cita.clienteId }
      });

      const emailText = `
        <p>Hola ${usuario.nombre},</p>
        <p>Recordatorio: Tu cita está programada para mañana a las ${cita.hora}.</p>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #dddddd;">
          <thead>
            <tr style="background-color: #007bff; color: #ffffff;">
              <th style="border: 1px solid #dddddd; padding: 8px;">Hora</th>
              <th style="border: 1px solid #dddddd; padding: 8px;">Servicio</th>
              <th style="border: 1px solid #dddddd; padding: 8px;">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #dddddd; padding: 8px; color: #ffffff; background-color: #007bff;">${cita.hora}</td>
              <td style="border: 1px solid #dddddd; padding: 8px; color: #ffffff; background-color: #007bff;">${cita.servicio.nombre}</td>
              <td style="border: 1px solid #dddddd; padding: 8px; color: #ffffff; background-color: #007bff;">${cita.sucursal.nombre}</td>
            </tr>
          </tbody>
        </table>
        <p>Gracias por su reserva. Si tiene alguna duda, por favor, contáctenos.</p>
      `;

      const pdfFilePath = await generatePDF(cita); // Genera el PDF

      await sendEmail(usuario.correo, 'Recordatorio de cita', emailText, [pdfFilePath]);
      console.log(`Correo enviado a ${usuario.correo} para la cita a las ${cita.hora}`);
    }
  } catch (error) {
    console.error('Error en el trabajo cron:', error);
  }
});
