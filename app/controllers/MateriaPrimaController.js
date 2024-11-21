const getToken = require("../helpers/get-token");
const MateriaPrima = require("../models/MateriaPrima");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class MateriaPrimaController {
  static async novaMateriaPrima(req, res) {
    const { nome_descricao, classe_tipo } = req.body;

    if (!nome_descricao) {
      return res.status(422).json({ message: "A descrição deve ser informada!" });
    }
    if (!classe_tipo) {
      return res.status(422).json({ message: "O tipo deve ser especificado!" });
    }

    const materiaPrima = new MateriaPrima({
      nome_descricao: nome_descricao,
      classe_tipo: classe_tipo,
    });

    try {
      await materiaPrima.save();
      res.status(201).json({ 
        message: "Matéria-prima cadastrada!",
        materiaPrima: materiaPrima 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao cadastrar matéria-prima",
        error: error.message 
      });
    }
  }

  static async editarMateriaPrima(req, res) {
    const { id } = req.params;
    const { nome_descricao, classe_tipo } = req.body;

    const verificarMateriaPrima = await MateriaPrima.findById(id);

    if (!verificarMateriaPrima) {
      return res.status(404).json({ message: "Matéria-prima não encontrada!" });
    }

    try {
      const materiaPrimaAtualizada = await MateriaPrima.findByIdAndUpdate(
        id,
        { $set: { nome_descricao, classe_tipo } },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Dados atualizados com sucesso!",
        materiaPrima: materiaPrimaAtualizada
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao atualizar matéria-prima",
        error: error.message 
      });
    }
  }

  static async listarMateriaPrima(req, res) {
    try {
      const materiaPrimas = await MateriaPrima.find().select("-__v");

      res.status(200).json({ 
        materiaPrimas: materiaPrimas,
        total: materiaPrimas.length 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao listar matérias-primas",
        error: error.message 
      });
    }
  }

  static async deletarMateriaPrima(req, res) {
    const { id } = req.params;

    const verificarMateriaPrima = await MateriaPrima.findById(id);

    if (!verificarMateriaPrima) {
      return res.status(404).json({ message: "Matéria-prima não encontrada!" });
    }

    try {
      await MateriaPrima.findByIdAndDelete(id);
      res.status(200).json({
        message: "Matéria-prima removida com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erro ao deletar matéria-prima",
        error: error.message 
      });
    }
  }
};