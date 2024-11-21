const User = require("../models/User");
const sendMail = require("./nodemailer");

async function enviarEmailNovaOs(ordemDeServico) {
  try {
    const to_email_users = await User.find({ level: "Administrador" }).select(
      "email -_id"
    );

    const to = to_email_users.map((user) => user.email);

    const subject = `Ordem de Serviço Criada - Nº ${ordemDeServico.numeroOs} por ${ordemDeServico.solicitante.name}`;

    const body = `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificação de Nova Ordem de Serviço</title>
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
                                Notificação de Nova Ordem de Serviço
                            </td>
                        </tr>
                        <tr>
                            <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                Prezado(a),<br><br>
                                Uma nova ordem de serviço foi criada.<br><br>
                                
                                <strong>Detalhes da Ordem de Serviço:</strong><br>
                                <ul>
                                    <li><strong>Número da OS:</strong> ${
                                      ordemDeServico.numeroOs
                                    }</li>
                                    <li><strong>Data de Solicitação:</strong> ${
                                      ordemDeServico.data_solicitacao
                                    }</li>
                                    <li><strong>Solicitante:</strong> ${
                                      ordemDeServico.solicitante.name
                                    }</li>
                                    <li><strong>E-mail do Solicitante:</strong> ${
                                      ordemDeServico.solicitante.email
                                    }</li>
                                    <li><strong>Telefone do Solicitante:</strong> ${
                                      ordemDeServico.solicitante.phone
                                    }</li>
                                </ul>

                                <strong>Amostras Solicitadas:</strong>
                                <ul>
                                    ${Object.entries(ordemDeServico.amostras)
                                      .map(
                                        ([key, amostra]) =>
                                          `<li>${amostra.nome_amostra} - ${amostra.ensaios_solicitados}. </li>`
                                      )
                                      .join("")}
                                </ul>

                                <strong>Observações:</strong><br>
                                ${ordemDeServico.observacao}
                                
                                <br><br>
                                Por favor, prossigam com os procedimentos necessários para atender esta solicitação.
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

module.exports = enviarEmailNovaOs;
