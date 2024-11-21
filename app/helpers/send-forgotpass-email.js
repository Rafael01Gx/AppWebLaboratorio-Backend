const sendMail = require("./nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

async function sendForgotPasswordMail(email) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario não encontrado!" });
    }
    const token = crypto.randomBytes(30).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    const body = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinição de Senha</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                            <!-- Header -->
                            <tr>
                                <td class="header" style="padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    Alteração de Senha - AppLab
                                </td>
                            </tr>
        
                            <!-- Body -->
                            <tr>
                                <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    Olá ${user.name}, <br><br>
                                    Recebemos uma solicitação para redefinir sua senha. Se você fez essa solicitação, clique no botão abaixo para escolher uma nova senha:
                                    <br><br>
                                    Se você não solicitou a alteração de senha, por favor, ignore este e-mail. Sua senha atual permanecerá a mesma.
                                </td>
                            </tr>
        
                            <!-- Call to action Button -->
                            <tr>
                                <td class="gray" style="padding: 0px 40px 0px 40px; text-align: center;">
                                    <!-- CTA Button -->
                                    <table cellspacing="0" cellpadding="0" style="margin: auto;">
                                        <tr>
                                            <td align="center" class="btn-color" style="padding: 10px 20px; border-radius: 5px;">
                                                <a href="${config.forgot_PASS_URL}/reset_password?token=${token}&email=${user.email}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
        
                            <!-- Extra Text -->
                            <tr>
                                <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    Este link é válido por uma hora. Após esse período, será necessário solicitar novamente a redefinição de senha.
                                </td>
                            </tr>
        
                            <!-- Footer -->
                            <tr>
                                <td class="footer" style=" padding: 40px; text-align: center; color: white; font-size: 14px;">
                                    &copy; 2024 AppLab. Todos os direitos reservados.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        <style>
        .btn-color{
        background-color: #005cbb;
        }
       .gray{
          background: #EEEEEE;
        }
        .footer{
        background:#005cbb;
        }
       .header{
         background:#005cbb;}
          @media screen and (max-width: 600px) {
            .content {
                width: 100% !important;
                display: block !important;
                padding: 10px !important;
            }
            .header, .body, .footer {
                padding: 20px !important;
            }
          }
        </style>
        </html>
        `;
    sendMail(email, "Alteração de senha AppLab", body);
  } catch (error) {
    res.status(400).json({ message: "Erro ao solicitar reset de password" });
  }
}
module.exports = sendForgotPasswordMail;
