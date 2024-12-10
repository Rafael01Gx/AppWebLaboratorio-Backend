const User = require("../models/User");
const sendMail = require("./nodemailer");
const config = require("../../config");

async function enviarEmailOsFinalizada(ordemDeServico) {
    const id = ordemDeServico.solicitante._id;
  try {
    const to = await User.findById(id).select("email -_id");

    const subject = `Ordem de Serviço Nº ${ordemDeServico.numeroOs} foi Finalizada `;

    const body = `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Ordem de Serviço Finalizada</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Poppins', Arial, sans-serif">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                        <tr>
                            <td class="header" style="background-color: #005cbb; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                Notificação de Ordem de Serviço Finalizada
                            </td>
                        </tr>
                        <tr>
                            <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                Prezado(a),<br><br>
                                A sua ordem de serviço foi finalizada com sucesso.<br><br>
                                A ordem de serviço está disponível para visualização e download. Você pode acessá-la clicando no link abaixo:
                                <br><br>
                                <a href="${config.aplication_URL}/ordem-de-servico/ordem-de-servico-concluidas" style="color: #005cbb; text-decoration: none; font-weight: bold;">Clique aqui para visualizar e fazer o download da Ordem de Serviço</a>
                                
                                <br><br>
                                Caso tenha alguma dúvida, entre em contato conosco.
                            </td>
                        </tr>

                        <tr>
                            <td class="important-notice" style="padding: 20px; text-align: left; font-size: 16px; line-height: 1.6; background-color:#e0e0df;">
                                <strong style="color:red;">Importante:</strong> Esta mensagem foi gerada automaticamente e não deve ser respondida. Caso tenha alguma dúvida, entre em contato por meio dos canais apropriados.
                            </td>
                        </tr>

                        <tr>
                            <td class="footer" style="background-color: #005cbb; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                Copyright &copy; 2024 | Equipe de Gerenciamento de Ordens de Serviço
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    <style>
     .header {
  background-color: #005cbb;
}
     .gray{
        background: #EEEEEE;
      }

      @media screen and (max-width: 600px) {
        .content {
            width: 100% !important;
            display: block !important;
            padding: 10px !important;
        }
        .header, .body, .footer, .important-notice {
            padding: 20px !important;
        }
       
      }
    </style>
    </html>`;

    sendMail(to, subject, body);
  } catch (error) {
    console.log(error);
  }
}

module.exports = enviarEmailOsFinalizada;
