const getToken = require("../helpers/get-token");
const ParametrosDeAnalise = require("../models/ParametrosDeAnalise");
const getUserByToken = require("../helpers/get-user-by-token");
const TipoDeAnalise = require("../models/TipoDeAnalise");

module.exports = class ParametrosDeAnaliseController {
  static async novoParametroDeAnalise(req, res) {
    const { tipo_de_analise, unidade_de_medida, descricao } = req.body;

    if (!tipo_de_analise) {
      res
        .status(422)
        .json({ message: "O tipo de análise precisa ser informado!" });
      return;
    }
    const tipoDeAnalise = await TipoDeAnalise.findById(tipo_de_analise._id);
    if (!tipoDeAnalise) {
      return res
        .status(422)
        .json({ message: "O tipo de análise não cadastrado!" });
    }

    if (!descricao) {
      res
        .status(422)
        .json({ message: "A descriçao precisa ser especificada!" });
      return;
    }

    const parametrosDeAnalise = new ParametrosDeAnalise({
      tipo_de_analise: {
        _id: tipoDeAnalise._id,
        tipo: tipoDeAnalise.tipo,
        classe: tipoDeAnalise.classe,
      },
      unidade_de_medida: unidade_de_medida,
      descricao: descricao,
    });

    try {
      await parametrosDeAnalise.save();
      res.status(200).json({ message: "Parâmetro de análise cadastrado!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async editarParametroDeAnalise(req, res) {
    const id = req.params.id;
    const { tipo_de_analise, unidade_de_medida, descricao } = req.body;

    const verificarParametro = await ParametrosDeAnalise.findById(id);

    if (!verificarParametro) {
      res.status(422).json({ message: "Parâmetro não encontrado!" });
      return;
    }
    const tipoDeAnalise = await TipoDeAnalise.findById(tipo_de_analise.id);

    !tipoDeAnalise
      ? res.status(422).json({ message: "Tipo de análise inválido!" })
      : null;

    try {
      await ParametrosDeAnalise.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            tipo_de_analise: {
              _id: tipoDeAnalise._id,
              tipo: tipoDeAnalise.tipo,
            },
            unidade_de_medida,
            descricao,
          },
        },
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

  static async listarParametroAnalise(req, res) {
    try {
      const parametros = await ParametrosDeAnalise.find().select("-__v");

      res.status(200).json({ parametros: parametros });
    } catch (error) {
      res.status(200).json({ error });
    }
  }

  static async deletarParametroAnalise(req, res) {
    const id = req.params.id;

    const verificarParametro = await ParametrosDeAnalise.findById(id);

    if (!verificarParametro) {
      res.status(422).json({ message: "Parâmetro de análise não encontrado!" });
      return;
    }

    try {
      await ParametrosDeAnalise.deleteOne({ _id: id });
      res.status(200).json({
        message: "Parâmetro removido com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
};
