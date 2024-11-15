const getToken = require("../helpers/get-token");
const sendMail = require("../helpers/nodemailer");
const Amostra = require("../models/Amostra");
const User = require("../models/User");
const getUserByToken = require("../helpers/get-user-by-token");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class OrdemDeServicoController {
  static async novaOrdemDeServico(req, res) {
    const { amostras, observacao } = req.body;
    const data_solicitacao = new Date().toLocaleDateString("pt-BR");

    if (
      !amostras ||
      typeof amostras !== "object" ||
      Object.keys(amostras).length === 0
    ) {
      return res.status(400).json({
        message: "Não é possível criar uma OS sem especificar as amostras!",
      });
    }
    const token = getToken(req);
    const user = await getUserByToken(token);

    const numeroOs = gerarNumeroOrdemDeServico();

    for (const chave in amostras) {
      if (amostras.hasOwnProperty(chave)) {
        const { nome_amostra, data_amostra, ensaios_solicitados } =
          amostras[chave];

        const amostra = new Amostra({
          numeroOs: numeroOs,
          nome_amostra: nome_amostra,
          data_amostra: data_amostra,
          ensaios_solicitados: ensaios_solicitados,
          solicitante: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        });

        try {
          await amostra.save();
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      }
    }
    const ordemDeServico = new OrdemDeServico({
      numeroOs: numeroOs,
      solicitante: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      amostras: amostras,
      data_solicitacao: data_solicitacao,
      observacao: observacao,
    });
    try {
      await ordemDeServico.save();
      res.status(200).json({ message: "Ordem de serviço criada com sucesso!" });
      enviarEmailNovaOs(ordemDeServico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async editarOrdemDeServicoAdm(req, res) {
    try {
      const { id } = req.params;
      const ordemDeServico = req.body.ordemDeServico;

      const ordemServico = await OrdemDeServico.findById(id);
      if (!ordemServico) {
        return res
          .status(422)
          .json({ message: "Ordem de serviço não encontrada!" });
      }

      if (
        !ordemDeServico.status &&
        !ordemDeServico.data_recepcao &&
        !ordemDeServico.prazo_inicio_fim
      ) {
        return res
          .status(422)
          .json({ message: "Não existem itens para serem modificados!" });
      }

      const updates_Os = {};
      const update_amostra = {};
      if (ordemDeServico.prazo_inicio_fim) {
        updates_Os.prazo_inicio_fim = ordemDeServico.prazo_inicio_fim;
        update_amostra.prazo_inicio_fim = ordemDeServico.prazo_inicio_fim;
      }
      if (ordemDeServico.data_recepcao) {
        updates_Os.data_recepcao = ordemDeServico.data_recepcao;
        update_amostra.data_recepcao = ordemDeServico.data_recepcao;
      }

      const statusValido = [
        "Aguardando Autorização",
        "Autorizada",
        "Em Execução",
        "Finalizada",
        "Cancelada",
      ];

      if (ordemDeServico.status) {
        if (!statusValido.includes(ordemDeServico.status)) {
          return res.status(422).json({ message: "Status inválido!" });
        }
        updates_Os.status = ordemDeServico.status;
        if (ordemDeServico.status !== "Em Execução")
          update_amostra.status = ordemDeServico.status;
      }

      const ordemAtualizada = await OrdemDeServico.findByIdAndUpdate(
        id, 
        { $set: updates_Os },
        { new: true }
      );

      if (update_amostra) {
        await Amostra.updateMany(
          { numeroOs: ordemServico.numeroOs },
          { $set: update_amostra }
        );
      }

      res.status(200).json({
        message: "Dados atualizados com sucesso!",
        ordemServico: ordemAtualizada,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erro ao atualizar a ordem de serviço.", error });
    }
  }

  static async listarOrdemDeServicoUserId(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    try {
      const ordemsDeServico = await OrdemDeServico.find({
        "solicitante._id": user.id,
      }).select("-__v");

      res.status(200).json({ ordemsDeServico: ordemsDeServico });
    } catch (error) {
      res.status(200).json({ error });
    }
  }

  static async listarTodasOrdemsDeServico(req, res) {
    try {
      const ordemsDeServico = await OrdemDeServico.find().select("-__v");
      res.status(200).json({ ordemsDeServico: ordemsDeServico });
    } catch (error) {
      res.status(200).json({ error });
    }
  }

  static async deletarOrdemDeServico(req, res) {
    const id = req.params.id;
    const token = getToken(req);
    const user = await getUserByToken(token);

    const ordemDeServico = await OrdemDeServico.findById(id);

    if (!ordemDeServico) {
      res.status(422).json({ message: "Ordem de servico não encontrada" });
      return;
    }

    if (user.id !== ordemDeServico.solicitante._id.toString()) {
      res.status(422).json({
        message: "Sem autorização para excluir esta ordem de serviço.",
      });
      return;
    }
    // console.log
    /* if (ordemDeServico.status !== "Aguardando Autorização" && ordemDeServico.status !== "Autorizada") {
      res.status(422).json({
        message: "Você não pode excluir uma ordem de serviço 'Em Execução'.",
      });
      return;
    } */

    try {
      await OrdemDeServico.deleteOne({ _id: id });
      await Amostra.deleteMany({ numeroOs: ordemDeServico.numeroOs });
      res.status(200).json({
        message: "Ordem de servico deletada com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }

  static async deletarOrdemDeServicoAdm(req, res) {
    const id = req.params.id;

    const ordemDeServico = await OrdemDeServico.findById(id);

    if (!ordemDeServico) {
      res.status(422).json({ message: "Ordem de servico não encontrada" });
      return;
    }

    try {
      await OrdemDeServico.deleteOne({ _id: id });
      await Amostra.deleteMany({ numeroOs: ordemDeServico.numeroOs });
      res.status(200).json({
        message: "Ordem de servico deletada com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
};

function gerarNumeroOrdemDeServico() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  const horas = String(now.getHours()).padStart(2, "0");
  const minutos = String(now.getMinutes()).padStart(2, "0");
  const segundos = String(now.getSeconds()).padStart(2, "0");

  const numeroOrdem = `LBF${ano}${mes}${dia}${horas}${minutos}${segundos}`;

  return numeroOrdem;
}

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
                        <!-- Header -->
                        <tr>
                            <td class="header" style=" padding: 40px; text-align: center; color: white; font-size: 24px;">
                                Notificação de Nova Ordem de Serviço
                            </td>
                        </tr>
    
                        <!-- Body -->
                        <tr>
                            <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
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
                                          `<li>${amostra.nome_amostra}</li>`
                                      )
                                      .join("")}
                                </ul>
    
                                <strong>Observações:</strong><br>
                                ${ordemDeServico.observacao}
                                
                                <br><br>
                                Por favor, prossigam com os procedimentos necessários para atender esta solicitação.
                            </td>
                        </tr>
    
                        <!-- Important Notice -->
                        <tr>
                            <td class="important-notice" style="padding: 20px; text-align: left; font-size: 16px; line-height: 1.6; background-color: #f8f8f8;">
                                <strong>Importante:</strong> Esta mensagem foi gerada automaticamente e não deve ser respondida. Caso tenha alguma dúvida, entre em contato por meio dos canais apropriados.
                            </td>
                        </tr>
    
                        <!-- Footer -->
                        <tr>
                            <td class="footer" style="background-color: #333333; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                Copyright &copy; 2024 | Equipe de Gerenciamento de Ordens de Serviço
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    <style>
     .header{
       background:  linear-gradient(
      90deg,
      oklch(63.32% 0.24 31.68) 0%,
      oklch(69.02% 0.277 332.77) 50%,
      oklch(53.18% 0.28 296.97) 100%
    );}

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
