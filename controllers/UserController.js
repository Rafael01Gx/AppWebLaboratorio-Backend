const jwt = require("jsonwebtoken");
const config = require("../config");
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const getUserByToken = require("../helpers/get-user-by-token");
const fs = require("fs");

module.exports = class UserController {
  static async sigin(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório"});  
      return;
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório" });
      return;
    }

    if (!validateEmail(email)) {
      res
        .status(422)
        .json({ message: "Esté endereço de e-mail não é válido!" });
      return;
    }

   /* if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    } */

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória" });
      return;
    }

    if (!confirmpassword) {
      res.status(422).json({ message: "A confirmação de senha é obrigatória" });
      return;
    }

    if (password !== confirmpassword) {
      res.status(422).json({
        message: "A senhas não conferem!",
      });
      return;
    }

    // check if user exist
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "E-mail já cadastrado. Por favor, ultilize outro e-mail",
      });
      return;
    }

    // email validation
    function validateEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create a user
    const user = new User({
      name: name,
      email: email,
      password: passwordHash,
    });

    try {
      await user.save();
      res.status(200).json({message: 'Cadastro efetuado!' });
    } catch (error) {
      res.status(500).json({ message: error });
    }
    
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório" });
      
      return;
    }

    if (!password) {
      res.status(422).json({ message: "O senha é obrigatória" });
      return;
    }

    // check if user exist
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(422).json({
        message: "Usuario não cadastrado!",
      });
      return;
    }

    // check if passowrd match with db pass
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({ message: "Senha inválida" });
      return;
    }

    if(!user.authorization){
      res.status(422).json({ message: "Aguardando autorização!" });
      return;
    }


    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token, config.token_key);

      currentUser = await User.findById(decoded.id).select("-password -__v");
      //currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, email, phone, password, confirmpassword } = req.body;

    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    user.name = name;

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório" });
      return;
    }

    if (!validateEmail(email)) {
      res
        .status(422)
        .json({ message: "Esté endereço de e-mail não é válido!" });
      return;
    }

    // check if email already taken exist
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      res.status(422).json({
        message: "E-mail já cadastrado. Por favor, ultilize outro e-mail",
      });
      return;
    }
    user.email = email;

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    }
    user.phone = phone;

    if (password !== confirmpassword) {
      res.status(422).json({
        message: "A senhas não conferem!",
      });
      return;
    } else if (password === confirmpassword && password != null) {
      // create a bcrypt password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }

    try {
      //returns user updated data
      await User.findOneAndUpdate(
        { _id: user.id },
        { $set: user },
        { new: true }
      );

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }

    // email validation
    function validateEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }
  }

  static async allUsers(req,res){
    const users= await User.find().select('-password -createdAt -__v')

    res.status(200).json({users:users})
  }

  static async editUserAdm(req, res) {
    const id = req.params.id
    const {authorization, level} = req.body;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);
    
    //validations
    if(user.level != 'Administrador' ){
      return res.status(403).json({message: "Ação restrita!"})
    }
    if(user.id == id){
      return res.status(403).json({message: "Esta açao não pode ser concluida, contate um Administrador!"})
    }
    if (level !== 'Usuário' && level !== 'Operador'&& level !=='Administrador') {
      res.status(422).json({ message: "Valor Inválido" });
      return;
    }
    
    try {
      //returns user updated data
      await User.findOneAndUpdate(
        { _id: id },
        { $set: {authorization,level} },
        { new: true }
      );

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }

  static async deleteUserById(req, res) {
    const id = req.params.id;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);
    
    //validations
    if(user.level != 'Administrador' ){
      return res.status(403).json({message: "Ação restrita!"})
    }
    if(user.id == id){
      return res.status(403).json({message: "O usuário não pode se auto-deletar!"})
    }
    const userToBeDeleted = await User.findById(id).select("-password");

    if (!userToBeDeleted) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    try {

      //returns user updated data
      await User.deleteOne({ _id: id }
      );
      res.status(200).json({
        message: "Usuário deletado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }
  
};
