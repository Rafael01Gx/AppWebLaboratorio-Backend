const jwt = require("jsonwebtoken");
const config = require("../../config");

const createUserToken = async (user, req, res) => {
  // create token
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
      authorization: user.authorization,
      level: user.level,
      
    },
    config.token_key
  );

  // return token
  res
    .status(200)
    .json({ message: "Autenticado", token: token, name: user.name, level: user.level });
};

module.exports = createUserToken;
