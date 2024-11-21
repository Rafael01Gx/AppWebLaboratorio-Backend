const ParametrosDeAnalise = require("../models/ParametrosDeAnalise");
const TipoDeAnalise = require("../models/TipoDeAnalise");

module.exports = class ParametrosDeAnaliseController {
  static async novoParametroDeAnalise(req, res) {
    const { tipo_de_analise, unidade_de_medida, descricao } = req.body;

    if (!tipo_de_analise) {
      return res.status(400).json({ message: "O tipo de análise precisa ser informado!" });
    }

    try {
      const tipoDeAnalise = await TipoDeAnalise.findById(tipo_de_analise._id);
      if (!tipoDeAnalise) {
        return res.status(404).json({ message: "Tipo de análise não cadastrado!" });
      }

      if (!descricao) {
        return res.status(400).json({ message: "A descrição precisa ser especificada!" });
      }

      const parametrosDeAnalise = new ParametrosDeAnalise({
        tipo_de_analise: {
          _id: tipoDeAnalise._id,
          tipo: tipoDeAnalise.tipo,
          classe: tipoDeAnalise.classe,
        },
        unidade_de_medida,
        descricao,
      });

      await parametrosDeAnalise.save();
      return res.status(201).json({ message: "Parâmetro de análise cadastrado!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao cadastrar parâmetro de análise." });
    }
  }

  static async editarParametroDeAnalise(req, res) {
    const { id } = req.params;
    const { tipo_de_analise, unidade_de_medida, descricao } = req.body;

    try {
      const parametroExistente = await ParametrosDeAnalise.findById(id);
      if (!parametroExistente) {
        return res.status(404).json({ message: "Parâmetro não encontrado!" });
      }

      const tipoDeAnalise = await TipoDeAnalise.findById(tipo_de_analise?.id);
      if (!tipoDeAnalise) {
        return res.status(400).json({ message: "Tipo de análise inválido!" });
      }

      await ParametrosDeAnalise.findByIdAndUpdate(
        id,
        {
          tipo_de_analise: {
            _id: tipoDeAnalise._id,
            tipo: tipoDeAnalise.tipo,
          },
          unidade_de_medida,
          descricao,
        },
        { new: true }
      );

      return res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar parâmetro de análise." });
    }
  }

  static async listarParametroAnalise(req, res) {
    try {
      const parametros = await ParametrosDeAnalise.find().select("-__v");
      return res.status(200).json({ parametros });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar parâmetros de análise." });
    }
  }

  static async deletarParametroAnalise(req, res) {
    const { id } = req.params;

    try {
      const parametro = await ParametrosDeAnalise.findById(id);
      if (!parametro) {
        return res.status(404).json({ message: "Parâmetro de análise não encontrado!" });
      }

      await ParametrosDeAnalise.deleteOne({ _id: id });
      return res.status(200).json({ message: "Parâmetro removido com sucesso!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao remover parâmetro de análise." });
    }
  }
};
