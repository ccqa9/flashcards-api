require('dotenv').config({ path: './.env' });

export default {
    env: process.env.NODE_ENV || 'dev',
    logger: {
        host: process.env.LOGGER_HOST,
        port: process.env.LOGGER_PORT 
    }
}