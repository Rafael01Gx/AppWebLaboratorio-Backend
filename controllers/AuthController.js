const config = require("../config");
const jwt = require("jsonwebtoken");

module.exports = class AuthController {


  static async verifyToken(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }
  
    try {
      const verified = jwt.verify(token, config.token_key);
      if (verified.authorization) {
        return res.status(200).json({ valid: true });
      } else {
        return res.status(403).json({ valid: false, message: "Usuário aguardando autorização" });
      }
    } catch (error) {
      return res.status(400).json({ valid: false, message: "Token inválido" });
    }
  }


};
