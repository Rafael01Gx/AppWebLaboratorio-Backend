const getToken = require("../helpers/get-token");
const Amostra = require("../models/Amostra");
const getUserByToken = require("../helpers/get-user-by-token");


module.exports = class AmostraController {

 static async editarAmostra (req,res){
    const id = req.params.id;
    const {amostra}  = req.body 
    console.log(amostra);
    
    const verificarAmostra = await Amostra.findById(id);

    if(!verificarAmostra){
        res.status(422).json({message: 'Amostra não encontrada !' });
        return;
    }

    if(!amostra){
        res.status(422).json({message: 'Sem dados a serem incluídos!' });
        return;
    return;
    }

    try {
        await Amostra.findOneAndUpdate({_id: id} ,amostra);
  
        res.status(200).json({
          message: "Dados incluídos com sucesso!",
        });
      } catch (error) {
        res.status(500).json({ message: error });
        return;
      }
  
 }

 static async listarAmostras( req,res){
    try {
        const amostras= await Amostra.find().select('-__v')

        res.status(200).json({amostras:amostras})
    } catch (error) {
        res.status(200).json({error})
    }
 }

 static async listarAmostrasPorIdUsuario( req,res){

    const token = getToken(req);
    const user = await getUserByToken(token);
    const id = user.id;

    try {
        const amostras = await Amostra.find({ 'solicitante.id': id });

        res.status(200).json({amostras:amostras})
    } catch (error) {
        res.status(200).json({error})
    }
 }

 static async deletarAmostra(req,res){
    const id = req.params.id;

    const token = getToken(req);
    const user = await getUserByToken(token);

    const amostra = await Amostra.findById(id);

    if (!amostra) {
      res.status(422).json({ message: "Amostra não encontrada" });
      return;
    }

    if (user.id !==  amostra.solicitante._id.toString()) {
      res
        .status(422)
        .json({
          message: "Sem autorização para excluir esta ordem de serviço.",
        });
        return;
      }

    try {

        await Amostra.deleteOne({ _id: id }
        );
        res.status(200).json({
          message: "Amostra deletada com sucesso!",
        });
      } catch (error) {
        res.status(500).json({ message: error });
        return;
      }
    }
 }




