const jwt = require("jsonwebtoken");
const config = require("../../config");
const bcrypt = require("bcrypt");
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const User = require("../models/User");
const sendForgotPasswordMail = require("../helpers/send-forgotpass-email");

module.exports = class UserController {
  static async sigin(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
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

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "E-mail já cadastrado. Por favor, ultilize outro e-mail",
      });
      return;
    }

    function validateEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      email: email,
      password: passwordHash,
    });

    try {
      await user.save();
      res.status(200).json({ message: "Cadastro efetuado!" });
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

    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      res.status(422).json({
        message: "Usuario não cadastrado!",
      });
      return;
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({ message: "Senha inválida" });
      return;
    }

    if (!user.authorization) {
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

      currentUser = await User.findById(decoded.id).select("-__v");
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

    const token = getToken(req);
    const user = await getUserByToken(token);

    const  {userEdit}  = req.body;

    if (!userEdit.name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    user.name = user.name;

    if (userEdit.area) user.area = userEdit.area;
    if (userEdit.funcao) user.funcao = userEdit.funcao;
    
    if (!userEdit.email) {
      res.status(422).json({ message: "O email é obrigatório" });
      return;
    }

    if (!validateEmail(userEdit.email)) {
      res
        .status(422)
        .json({ message: "Esté endereço de e-mail não é válido!" });
      return;
    }

    const userExists = await User.findOne({ email: userEdit.email });

    if (user.email !== userEdit.email && userExists) {
      res.status(422).json({
        message: "E-mail já cadastrado. Por favor, ultilize outro e-mail",
      });
      return;
    }
    user.email = userEdit.email;

    if (!userEdit.phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    }
    user.phone = userEdit.phone;
    if(userEdit.notifications) user.notifications = userEdit.notifications;

    try {
      await User.findOneAndUpdate(
        { _id: user.id },
        { $set:user },
        { new: true }
      );

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }

    function validateEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }
  }

  static async allUsers(req, res) {
    const users = await User.find().select("-password -createdAt -__v");

    res.status(200).json({ users: users });
  }

  static async editUserAdm(req, res) {
    const id = req.params.id;
    const { authorization, level } = req.body;

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (user.level != "Administrador") {
      return res.status(403).json({ message: "Ação restrita!" });
    }
    if (user.id == id) {
      return res.status(403).json({
        message: "Esta açao não pode ser concluida, contate um Administrador!",
      });
    }
    if (
      level !== "Usuário" &&
      level !== "Operador" &&
      level !== "Administrador"
    ) {
      res.status(422).json({ message: "Valor Inválido" });
      return;
    }

    try {
      await User.findOneAndUpdate(
        { _id: id },
        { $set: { authorization, level } },
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

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (user.level != "Administrador") {
      return res.status(403).json({ message: "Ação restrita!" });
    }
    if (user.id == id) {
      return res
        .status(403)
        .json({ message: "O usuário não pode se auto-deletar!" });
    }
    const userToBeDeleted = await User.findById(id);

    if (!userToBeDeleted) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    try {
      await User.deleteOne({ _id: id });
      res.status(200).json({
        message: "Usuário deletado com sucesso!",
      });
    } catch (error) {
      res.status(500).json({ message: error });
      return;
    }
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email inválido" });
    try {
      sendForgotPasswordMail(email);
    } catch (error) {
      res.status(400).json({ message: "Erro ao solicitar reset de password" });
    }

    res.status(200).json({
      message:
        "Solicitação de redefinição de senha enviada com sucesso. Verifique seu e-mail para redefinir sua senha.",
    });
  }

  static async resetPassword(req, res) {
    const { user_recovery } = req.body;

    if (!user_recovery.token) {
      return res.status(400).json({ message: "Token inválido ou ausente!" });
    }

    try {
      const user = await User.findOne({ email: user_recovery.email }).select(
        "+passwordResetToken passwordResetExpires"
      );
      if (!user) {
        return res.status(400).json({ message: "Usuario não encontrado!" });
      }
      if (user_recovery.token !== user.passwordResetToken) {
        return res.status(400).json({ message: "Token inválido." });
      }
      const now = new Date();
      if (now > user.passwordResetExpires) {
        return res
          .status(400)
          .json({ message: "Token expirado, faça uma nova solicitação!" });
      }
      if (!user_recovery.password && !user_recovery.confirmpassword) {
        return res.status(422).json({
          message: "A senha e a confirmação da senha são obrigatórias",
        });
      }
      if (user_recovery.password !== user_recovery.confirmpassword) {
        return res.status(422).json({ message: "A senhas não conferem!" });
      }

      const salt = await bcrypt.genSalt(12);
      const new_password = await bcrypt.hash(user_recovery.password, salt);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          password: new_password,
        },
      });

      res.status(200).json({
        message: "Senha alterada com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }
};
