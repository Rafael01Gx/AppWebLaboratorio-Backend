const getToken = require("../helpers/get-token");
const Amostra = require("../models/Amostra");
const getUserByToken = require("../helpers/get-user-by-token");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class OrdemDeServicoController {
  static async novaOrdemDeServico(req, res) {
    const { amostras, observacao } = req.body;
    const data_solicitacao = new Date().toLocaleDateString("pt-BR");
if (!amostras || typeof amostras !== 'object' || Object.keys(amostras).length === 0) {
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
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async editarOrdemDeServicoAdm(req, res) {
    try {
      const { id } = req.params;
      const ordemDeServico = req.body.ordemDeServico


     // const { data_recepcao, status, prazo_inicio_fim } = req.body;
  
      const ordemServico = await OrdemDeServico.findById(id);
      if (!ordemServico) {
        return res.status(422).json({ message: "Ordem de serviço não encontrada!" });
      }

      if (!ordemDeServico.status && !ordemDeServico.data_recepcao && !ordemDeServico.prazo_inicio_fim) {
        return res.status(422).json({ message: "Não existem itens para serem modificados!" });
      }
  
      const updates_Os = {};
      const update_amostra={};
      if (ordemDeServico.prazo_inicio_fim){ 
        updates_Os.prazo_inicio_fim= ordemDeServico.prazo_inicio_fim;
        update_amostra.prazo_inicio_fim = ordemDeServico.prazo_inicio_fim;
      }
      if (ordemDeServico.data_recepcao) {
        updates_Os.data_recepcao = ordemDeServico.data_recepcao;
        update_amostra.data_recepcao = ordemDeServico.data_recepcao;
      }

      const statusValido = ["Aguardando Autorização", "Autorizada", "Em Execução", "Finalizada", "Cancelada"];
      
      if (ordemDeServico.status) {
        if (!statusValido.includes(ordemDeServico.status)) {
          return res.status(422).json({ message: "Status inválido!" });
        }
        updates_Os.status = ordemDeServico.status;
        if(ordemDeServico.status != "Em Execução")update_amostra.status = ordemDeServico.status;

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
        ordemServico: ordemAtualizada
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar a ordem de serviço.", error });
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


    if (user.id !==  ordemDeServico.solicitante._id.toString()) {
      res
        .status(422)
        .json({
          message: "Sem autorização para excluir esta ordem de serviço.",
        });
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
