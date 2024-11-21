const jwt = require("jsonwebtoken");
const getToken = require("./get-token");
const config = require("../../config");

// middleware to validate token
const checkLevelAdm = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  try {
    const verified = jwt.verify(token, config.token_key);
    if(verified.authorization && verified.level=="Administrador"){
      req.user = verified;
    next()
    } else{
      return res.status(403).json({message: "Acesso restrito"})
    }
    
  } catch (error) {
    return res.status(400).json({ message: "Token inválido " });
    
  }
 
};

const checkLevelOp = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado! " });
  }

  try {
    const verified = jwt.verify(token, config.token_key);
    if(verified.authorization && (verified.level=="Administrador" || verified.level=="Operador")){
      req.user = verified;
    next()
    } else{
      return res.status(403).json({message: "Acesso restrito"})
    }
    
  } catch (error) {
    return res.status(400).json({ message: "Token inválido " });
    
  }
 
};

module.exports = {checkLevelAdm,checkLevelOp}
