const TipoDeAnalise = require("../models/TipoDeAnalise");

module.exports = class TipoDeAnaliseController {
  static async novoTipoDeAnalise(req, res) {
    const { tipo, classe } = req.body;

    if (!tipo) {
      return res.status(400).json({ message: "O tipo precisa ser informado!" });
    }

    if (!classe) {
      return res.status(400).json({ message: "A classe precisa ser informada!" });
    }

    const tipoDeAnalise = new TipoDeAnalise({ tipo, classe });

    try {
      await tipoDeAnalise.save();
      return res.status(201).json({ message: "Tipo de análise cadastrado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao cadastrar tipo de análise." });
    }
  }

  static async editarTipoDeAnalise(req, res) {
    const { id } = req.params;
    const { tipo, classe } = req.body;

    try {
      const tipoExistente = await TipoDeAnalise.findById(id);
      if (!tipoExistente) {
        return res.status(404).json({ message: "Tipo de análise não encontrado!" });
      }

      const atualizar = {};
      if (tipo) atualizar.tipo = tipo;
      if (classe) atualizar.classe = classe;

      await TipoDeAnalise.findByIdAndUpdate(id, { $set: atualizar }, { new: true });

      return res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar tipo de análise." });
    }
  }

  static async listarTipoDeAnalise(req, res) {
    try {
      const tipo = await TipoDeAnalise.find().select("-__v");
      return res.status(200).json({ tipo_de_analise: tipo });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar tipos de análise." });
    }
  }

  static async deletarTipoDeAnalise(req, res) {
    const { id } = req.params;

    try {
      const tipoDeAnalise = await TipoDeAnalise.findById(id);
      if (!tipoDeAnalise) {
        return res.status(404).json({ message: "Tipo de análise não encontrado!" });
      }

      await TipoDeAnalise.deleteOne({ _id: id });
      return res.status(200).json({ message: "Tipo de análise deletado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao deletar tipo de análise." });
    }
  }
};
