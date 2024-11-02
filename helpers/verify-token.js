const jwt = require("jsonwebtoken");
const getToken = require("./get-token");
const config = require("../config");

// middleware to validate token
const checkToken = (req, res, next) => {
 
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  const token = getToken(req);
  
  if (!token) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  try {
    const verified = jwt.verify(token, config.token_key);
    if(verified.authorization){
      req.user = verified;
    next()
    } else{
      return res.status(200).json({message: "Usuario aguardando autorização para acesso!"})
    }
    
  } catch (error) {
    return res.status(400).json({ message: "Token inválido!" });
    
  }
 
};


module.exports = checkToken;
