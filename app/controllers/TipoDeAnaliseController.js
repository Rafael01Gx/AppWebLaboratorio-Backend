const getToken = require("../helpers/get-token");
const TipoDeAnalise = require("../models/TipoDeAnalise");
const getUserByToken = require("../helpers/get-user-by-token");


module.exports = class TipoDeAnaliseController {

 static async novoTipoDeAnalise (req,res){

    const{ tipo,classe } = req.body

    if(!tipo){
        res.status(422).json({message: 'O tipo precisa ser informada!' });
        return;
    }
    if(!classe){
      res.status(422).json({message: 'O tipo precisa ser informada!' });
      return;
  }

    const tipoDeAnalise = new TipoDeAnalise({
        tipo: tipo,
        classe:classe
      });
  
      try {
        await tipoDeAnalise.save();
        res.status(200).json({message: 'Tipo de análise cadastrado!' });
      } catch (error) {
        res.status(500).json({ message: error });
      }
 }

 static async editarTipoDeAnalise (req,res){
    const id = req.params.id;
    const {tipo,classe } = req.body
    
    const verificarTipo = await TipoDeAnalise.findById(id);

    let atualizar = {}

    if(!verificarTipo){
        res.status(422).json({message: 'Tipo de análise não encontrado!' });
        return;
    }

    tipo !== "" ? atualizar.tipo=tipo : null ;
  
   classe !== "" ? atualizar.classe=classe : null ; 
  

    try {
        await TipoDeAnalise.findOneAndUpdate(
          { _id: id },
          { $set: atualizar },
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

 static async listarTipoDeAnalise( req,res){
    try {
        const tipo= await TipoDeAnalise.find().select('-__v')

        res.status(200).json({tipo_de_analise:tipo})
    } catch (error) {
        res.status(200).json({error})
    }
 }

 static async deletarTipoDeAnalise(req,res){
    const id = req.params.id;

    const tipoDeAnalise = await TipoDeAnalise.findById(id);

    if (!tipoDeAnalise) {
      res.status(422).json({ message: "Amostra não encontrada" });
      return;
    }

    try {

        await TipoDeAnalise.deleteOne({ _id: id }
        );
        res.status(200).json({
          message: "Deletado com sucesso!",
        });
      } catch (error) {
        res.status(500).json({ message: error });
        return;
      }
    }
 }
