const getToken = require("../helpers/get-token");
const ConfiguracaoDeAnalise = require("../models/ConfiguracaoDeAnalise");
const getUserByToken = require("../helpers/get-user-by-token");
const TipoDeAnalise = require("../models/TipoDeAnalise");
const MateriaPrima = require("../models/MateriaPrima");

module.exports = class ConfiguracaoDeAnaliseController {
  static async novoConfiguracaoDeAnalise(req, res) {
    try {
      const { tipo_de_analise, materia_prima, parametros_de_analise } = req.body;

      // Validate required fields with more concise validation
      if (!tipo_de_analise?._id) {
        return res.status(422).json({ message: "O tipo de análise precisa ser informado!" });
      }

      const [tipoDeAnalise, materiaPrima] = await Promise.all([
        TipoDeAnalise.findById(tipo_de_analise._id),
        MateriaPrima.findById(materia_prima?._id)
      ]);

      if (!tipoDeAnalise) {
        return res.status(422).json({ message: "O tipo de análise não cadastrado!" });
      }

      if (!materiaPrima) {
        return res.status(422).json({ message: "A matéria-prima não cadastrada!" });
      }

      if (!parametros_de_analise) {
        return res.status(422).json({ message: "O parâmetro precisa ser especificado!" });
      }

      const configuracaoDeAnalise = new ConfiguracaoDeAnalise({
        tipo_de_analise: {
          _id: tipoDeAnalise._id,
          tipo: tipoDeAnalise.tipo,
          classe: tipoDeAnalise.classe,
        },
        materia_prima: {
          _id: materiaPrima._id,
          nome_descricao: materiaPrima.nome_descricao,
          classe_tipo: materiaPrima.classe_tipo,
        },
        parametros_de_analise: parametros_de_analise,
      });

      await configuracaoDeAnalise.save();
      res.status(201).json({ 
        message: "Parâmetro de análise cadastrado!",
        data: configuracaoDeAnalise 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao cadastrar configuração de análise",
        error: error.message 
      });
    }
  }

  static async editarConfiguracaoDeAnalise(req, res) {
    try {
      const { id } = req.params;
      const parametros_de_analise = req.body;

      if (!parametros_de_analise) {
        return res.status(422).json({ message: "Parâmetro não Informado!" });
      }

      const configuracaoExistente = await ConfiguracaoDeAnalise.findById(id);

      if (!configuracaoExistente) {
        return res.status(404).json({ message: "Parâmetro não encontrado!" });
      }

      const configuracaoAtualizada = await ConfiguracaoDeAnalise.findByIdAndUpdate(
        id,
        { $set: parametros_de_analise },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Dados atualizados com sucesso!",
        data: configuracaoAtualizada
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao atualizar configuração de análise",
        error: error.message 
      });
    }
  }

  static async listarConfiguracaoDeAnalise(req, res) {
    try {
      const configuracaoDeAnalise = await ConfiguracaoDeAnalise.find().select('-__v');
  
      res.status(200).json({ 
        configuracaoDeAnalise: configuracaoDeAnalise
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao listar configurações de análise",
        error: error.message 
      });
    }
  }

  static async deletarConfiguracaoDeAnalise(req, res) {
    try {
      const { id } = req.params;

      const verificarParametro = await ConfiguracaoDeAnalise.findById(id);

      if (!verificarParametro) {
        return res.status(404).json({ message: "Parâmetro de análise não encontrado!" });
      }

      await ConfiguracaoDeAnalise.findByIdAndDelete(id);
      
      res.status(200).json({
        message: "Parâmetro removido com sucesso!"
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao deletar configuração de análise",
        error: error.message 
      });
    }
  }
};