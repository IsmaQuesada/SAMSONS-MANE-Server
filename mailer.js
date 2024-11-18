// mailer.js
const nodemailer = require('nodemailer');
const path = require('path'); // Asegúrate de importar 'path'

const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu proveedor de correo
  auth: {
    user: 'felipedesign28@gmail.com',
    pass: 'ebpn lnmf phca odpc'
  }
});

const sendEmail = async (to, subject, html,attachments = []) => {
  const mailOptions = {
    from: 'tu-email@gmail.com',
    to,
    subject,
    html,
    attachments: attachments.map(filePath => ({
      filename: path.basename(filePath),
      path: filePath
    }))
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado');
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
};

module.exports = sendEmail;
