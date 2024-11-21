const getToken = require("../helpers/get-token");
const Amostra = require("../models/Amostra");
const getUserByToken = require("../helpers/get-user-by-token");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AmostraController {
  // Helper function
  static async findAmostraById(id) {
    const amostra = await Amostra.findById(id);
    if (!amostra) throw new Error("Amostra não encontrada!");
    return amostra;
  }

  static async editarAmostra(req, res) {
    const id = req.params.id;
    const { amostra } = req.body;

    try {
      const verificarAmostra = await this.findAmostraById(id);

      if (!amostra) {
        return res.status(422).json({ message: "Sem dados a serem incluídos!" });
      }

      await Amostra.findOneAndUpdate({ _id: id }, amostra);

      if (amostra.progresso !== 0) {
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
      res.status(500).json({ message: error.message });
    }
  }

  static async listarAmostras(req, res) {
    try {
      const amostras = await Amostra.find().select("-__v");
      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async listarAmostrasPorIdUsuario(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const amostras = await Amostra.find({ "solicitante.id": user.id });
      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      if (!amostras.length) {
        return res
          .status(404)
          .json({
            message:
              "Nenhuma amostra foi encontrada para a ordem de serviço informada",
          });
      }

      res.status(200).json({ amostras });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deletarAmostra(req, res) {
    const id = req.params.id;

    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const amostra = await this.findAmostraById(id);

      if (user.id !== amostra.solicitante._id.toString()) {
        return res
          .status(403)
          .json({
            message:
              "Sem autorização para excluir esta ordem de serviço.",
          });
      }

      await Amostra.deleteOne({ _id: id });
      res.status(200).json({ message: "Amostra deletada com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
