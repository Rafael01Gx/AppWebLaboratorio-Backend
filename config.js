const env = require('env-var')
const config = {
    token_key: env.get('TOKEN_KEY').required().asString(),
    db_URL: env.get('DATABASE_URL').required().asUrlString(),
    port: env.get('LOCAL_PORT').required().asInt()
}

module.exports = config