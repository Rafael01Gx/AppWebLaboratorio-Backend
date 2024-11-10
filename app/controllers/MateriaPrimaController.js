const getToken = require("../helpers/get-token");
const MateriaPrima = require("../models/MateriaPrima");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class MateriaPrimaController {
  static async novaMateriaPrima(req, res) {
    const {nome_descricao, classe_tipo} = req.body;

    if (!nome_descricao) {
      res
        .status(422)
        .json({ message: "A descição deve ser informada!" });
      return;
    }
    if (!classe_tipo) {
      res
        .status(422)
        .json({ message: "O tipo deve ser especificado!" });
      return;
    }

    const materiaPrima = new MateriaPrima({
        nome_descricao: nome_descricao,
        classe_tipo: classe_tipo,
    });

    try {
      await materiaPrima.save();
      res.status(200).json({ message: "Matéria-prima cadastrada!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async editarMateriaPrima(req, res) {
    const id = req.params.id;
    const {nome_descricao, classe_tipo} = req.body;

    const verificarMateriaPrima = await MateriaPrima.findById(id);

    if (!verificarMateriaPrima) {
      res.status(422).json({ message: "Matéria-prima não encontrada!" });
      return;
    }

    try {
      await MateriaPrima.findOneAndUpdate(
        { _id: id },
        { $set: {nome_descricao, classe_tipo} },
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

  static async listarMateriaPrima(req, res) {
    try {
      const materiaPrimas = await MateriaPrima.find().select("-__v");

      res.status(200).json({ materiaPrimas: materiaPrimas });
    } catch (error) {
      res.status(200).json({ error });
    }
  }

  static async deletarMateriaPrima(req, res) {
    
    const id = req.params.id;

    const verificarMateriaPrima = await MateriaPrima.findById(id);

    if (!verificarMateriaPrima) {
      res.status(422).json({ message: "Matéria-prima não encontrada!" });
      return;
    }

    try {
      await MateriaPrima.deleteOne({ _id: id });
      res.status(200).json({
        message: "Matéria-prima removida com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
};
