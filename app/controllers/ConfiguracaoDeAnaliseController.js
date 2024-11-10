const getToken = require("../helpers/get-token");
const ConfiguracaoDeAnalise = require("../models/ConfiguracaoDeAnalise");
const getUserByToken = require("../helpers/get-user-by-token");
const TipoDeAnalise = require("../models/TipoDeAnalise");
const MateriaPrima = require("../models/MateriaPrima");

module.exports = class ConfiguracaoDeAnaliseController {
  static async novoConfiguracaoDeAnalise(req, res) {
    const { tipo_de_analise, materia_prima, parametros_de_analise } = req.body;

    if (!tipo_de_analise) {
      res
        .status(422)
        .json({ message: "O tipo de análise precisa ser informado!" });
      return;
    }
    const tipoDeAnalise = await TipoDeAnalise.findById(tipo_de_analise._id);
    if (!tipoDeAnalise) {
      res.status(422).json({ message: "O tipo de análise não cadastrado!" });
      return;
    }
    if (!materia_prima) {
      res
        .status(422)
        .json({ message: "A matéria-prima precisa ser especificada!" });
      return;
    }
    const materiaPrima = await MateriaPrima.findById(materia_prima._id);

    if (!materiaPrima) {
      res.status(422).json({ message: "A matéria-prima não cadastrada!" });
      return;
    }

    if (!parametros_de_analise) {
      res
        .status(422)
        .json({ message: "O parâmetro precisa ser especificada!" });
      return;
    }

    const configuracaoDeAnalise = new ConfiguracaoDeAnalise({
      tipo_de_analise: { _id: tipoDeAnalise._id, tipo: tipoDeAnalise.tipo,classe: tipoDeAnalise.classe},
      materia_prima: {
        _id: materiaPrima._id,
        nome_descricao: materiaPrima.nome_descricao,
        classe_tipo: materiaPrima.classe_tipo,
      },
      parametros_de_analise: parametros_de_analise,
    });

    try {
      await configuracaoDeAnalise.save();
      res.status(200).json({ message: "Parâmetro de análise cadastrado!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async editarConfiguracaoDeAnalise(req, res) {
    const id = req.params.id;

    const parametros_de_analise = req.body;


    if (!parametros_de_analise) {
      res.status(422).json({ message: "Parâmetro não Informado!" });
      return;
    }

    const verificarParametro = await ConfiguracaoDeAnalise.findById(id);

    if (!verificarParametro) {
      res.status(422).json({ message: "Parâmetro não encontrado!" });
      return;
    }

    try {
      await ConfiguracaoDeAnalise.findOneAndUpdate(
        { _id: id },
        { $set: parametros_de_analise },
        { new: true }
      );
      res.status(200).json({
        message: "Dados atualizados com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }

  static async listarConfiguracaoDeAnalise(req, res) {
    try {
      const configuracaoDeAnalise = await ConfiguracaoDeAnalise.find().select("-__v");

      res.status(200).json({ configuracaoDeAnalise: configuracaoDeAnalise });
    } catch (error) {
      res.status(200).json({ error });
    }
  }

  static async deletarConfiguracaoDeAnalise(req, res) {
    const id = req.params.id;

    const verificarParametro = await ConfiguracaoDeAnalise.findById(id);

    if (!verificarParametro) {
      res.status(422).json({ message: "Parâmetro de análise não encontrado!" });
      return;
    }

    try {
      await ConfiguracaoDeAnalise.deleteOne({ _id: id });
      res.status(200).json({
        message: "Parâmetro removido com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
};
