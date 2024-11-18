const jwt = require("jsonwebtoken");
const config = require("../../config");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const sendMail = require("../helpers/nodemailer");
const User = require("../models/User");

module.exports = class UserController {
  static async sigin(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    //validations
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

    // check if user exist
    const user = await User.findOne({ email: email }).select("+password");
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

    const { name, email, phone} = req.body;

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

  static async allUsers(req, res) {
    const users = await User.find().select("-password -createdAt -__v");

    res.status(200).json({ users: users });
  }

  static async editUserAdm(req, res) {
    const id = req.params.id;
    const { authorization, level } = req.body;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    //validations
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
      //returns user updated data
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

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    //validations
    if (user.level != "Administrador") {
      return res.status(403).json({ message: "Ação restrita!" });
    }
    if (user.id == id) {
      return res
        .status(403)
        .json({ message: "O usuário não pode se auto-deletar!" });
    }
    const userToBeDeleted = await User.findById(id).select("-password");

    if (!userToBeDeleted) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    try {
      //returns user updated data
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
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Usuario não encontrado!" });
      }
      const token = crypto.randomBytes(30).toString("hex");
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });
      const body = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Poppins', Arial, sans-serif">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                  <td align="center" style="padding: 20px;">
                      <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                          <!-- Header -->
                          <tr>
                              <td class="header" style="padding: 40px; text-align: center; color: white; font-size: 24px;">
                                  Alteração de Senha - AppLab
                              </td>
                          </tr>
      
                          <!-- Body -->
                          <tr>
                              <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                  Olá ${user.name}, <br><br>
                                  Recebemos uma solicitação para redefinir sua senha. Se você fez essa solicitação, clique no botão abaixo para escolher uma nova senha:
                                  <br><br>
                                  Se você não solicitou a alteração de senha, por favor, ignore este e-mail. Sua senha atual permanecerá a mesma.
                              </td>
                          </tr>
      
                          <!-- Call to action Button -->
                          <tr>
                              <td class="gray" style="padding: 0px 40px 0px 40px; text-align: center;">
                                  <!-- CTA Button -->
                                  <table cellspacing="0" cellpadding="0" style="margin: auto;">
                                      <tr>
                                          <td align="center" class="btn-color" style="padding: 10px 20px; border-radius: 5px;">
                                              <a href="${config.forgot_PASS_URL}/reset_password?token=${token}&email=${user.email}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
      
                          <!-- Extra Text -->
                          <tr>
                              <td class="body gray" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                  Este link é válido por uma hora. Após esse período, será necessário solicitar novamente a redefinição de senha.
                              </td>
                          </tr>
      
                          <!-- Footer -->
                          <tr>
                              <td class="footer" style=" padding: 40px; text-align: center; color: white; font-size: 14px;">
                                  &copy; 2024 AppLab. Todos os direitos reservados.
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      <style>
      .btn-color{
      background-color: #005cbb;
      }
     .gray{
        background: #EEEEEE;
      }
      .footer{
      background:#005cbb;
      }
     .header{
       background:#005cbb;}
        @media screen and (max-width: 600px) {
          .content {
              width: 100% !important;
              display: block !important;
              padding: 10px !important;
          }
          .header, .body, .footer {
              padding: 20px !important;
          }
        }
      </style>
      </html>
      `;
      sendMail(email, "Alteração de senha AppLab", body);
      res
        .status(200)
        .json({
          message:
            "Solicitação de redefinição de senha enviada com sucesso. Verifique seu e-mail para redefinir sua senha.",
        });
    } catch (error) {
      res.status(400).json({ message: "Erro ao solicitar reset de password" });
    }
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
        return res
          .status(422)
          .json({
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
