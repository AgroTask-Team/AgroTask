const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'Configuração de e-mail incompleta. Verifique SMTP_HOST, SMTP_USER e SMTP_PASS.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const safeName = name || 'usuário';

  await transporter.sendMail({
    from,
    to,
    subject: 'AgroTask - Redefinição de senha',
    text: [
      `Olá, ${safeName}.`,
      '',
      'Recebemos uma solicitação para redefinir sua senha no AgroTask.',
      'Para criar uma nova senha, acesse o link abaixo:',
      '',
      resetUrl,
      '',
      'Se você não solicitou essa alteração, ignore este e-mail.',
      'Este link expira em 1 hora.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">AgroTask</h2>
        <p>Olá, <strong>${safeName}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir sua senha no AgroTask.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p style="margin: 24px 0;">
          <a
            href="${resetUrl}"
            style="
              background: #176f34;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 20px;
              border-radius: 10px;
              display: inline-block;
              font-weight: 600;
            "
          >
            Redefinir senha
          </a>
        </p>
        <p>Ou, se preferir, copie e cole este link no navegador:</p>
        <p style="word-break: break-word;">${resetUrl}</p>
        <p>Este link expira em <strong>1 hora</strong>.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
};