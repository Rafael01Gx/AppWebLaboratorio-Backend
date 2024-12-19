const env = require('env-var');
require('dotenv').config();
const config = {
    token_key: env.get('TOKEN_KEY').required().asString(),
    db_URL: env.get('DATABASE_URL').required().asString(),
    port: env.get('LOCAL_PORT').required().asInt(),
    aplication_URL: env.get('APLICATION_URL').required().asString(),
    mail_HOST: env.get('MAIL_HOST').required().asString(),
    mail_PORT: env.get('MAIL_PORT').required().asString(),
    mail_USER: env.get('MAIL_USER').required().asString(),
    mail_PASS: env.get('MAIL_PASS').required().asString(),
    mail_FROM: env.get('MAIL_FROM').required().asString()
}

module.exports = config