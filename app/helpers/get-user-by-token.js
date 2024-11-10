const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {token_key} = require("../../config");

// get user by jwt token
const getUserByToken = async (token) => {
  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  const decoaded = jwt.verify(token, token_key);

  const userId = decoaded.id;

  const user = await User.findOne({ _id: userId });

  return user;
};

module.exports = getUserByToken;