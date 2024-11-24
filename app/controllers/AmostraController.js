const getToken = require("../helpers/get-token");
const Amostra = require("../models/Amostra");
const getUserByToken = require("../helpers/get-user-by-token");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AmostraController {
  static async editarAmostra(req, res) {
    const id = req.params.id;
    const { amostra } = req.body;

    if (!amostra) {
      return res.status(422).json({ message: "Sem dados a serem incluídos!" });
    }

    try {
      const verificarAmostra = await Amostra.findById(id);

      if (!verificarAmostra) {
        return res.status(404).json({ message: "Amostra não encontrada!" });
      }

      await Amostra.findByIdAndUpdate(id, amostra);

      if (amostra.progresso && amostra.nome_amostra) {
        const updateProgresso = {
          [`progresso.${amostra.nome_amostra}`]: amostra.progresso,
        };

        await OrdemDeServico.findOneAndUpdate(
          { numeroOs: amostra.numeroOs },
          { $set: updateProgresso }
        );
      }

      res.status(200).json({ message: "Dados incluídos com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar a amostra.", error });
    }
  }

  static async listarAmostras(req, res) {
    try {
      const amostras = await Amostra.find().select("-__v");
      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: "Erro ao listar as amostras.", error });
    }
  }

  static async listarAmostrasPorIdUsuario(req, res) {
    try {
      const token = getToken(req);
      if (!token) {
        return res.status(401).json({ message: "Token não fornecido!" });
      }

      const user = await getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      const amostras = await Amostra.find({ "solicitante.id": user.id });
      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: "Erro ao listar as amostras.", error });
    }
  }

  static async listarAmostrasPorOrdemDeServico(req, res) {
    const numeroOs = req.params.id;

    if (!numeroOs) {
      return res
        .status(400)
        .json({ message: "Número da Ordem de Serviço precisa ser informado!" });
    }

    try {
      const amostras = await Amostra.find({ numeroOs });

      if (amostras.length === 0) {
        return res.status(404).json({
          message:
            "Nenhuma amostra foi encontrada para a ordem de serviço informada.",
        });
      }

      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: "Erro ao listar as amostras.", error });
    }
  }

  static async deletarAmostra(req, res) {
    const id = req.params.id;

    try {
      const token = getToken(req);
      if (!token) {
        return res.status(401).json({ message: "Token não fornecido!" });
      }

      const user = await getUserByToken(token);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      const amostra = await Amostra.findById(id);
      if (!amostra) {
        return res.status(404).json({ message: "Amostra não encontrada." });
      }

      if (user.id !== amostra.solicitante._id.toString()) {
        return res.status(403).json({
          message: "Sem autorização para excluir esta ordem de serviço.",
        });
      }

      await Amostra.deleteOne({ _id: id });
      res.status(200).json({ message: "Amostra deletada com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar a amostra.", error });
    }
  }
};
