import fs         from 'fs';
import express    from 'express';
import cors       from 'cors'
import bodyParser from 'body-parser';
import jwt        from 'express-jwt';
import winston    from 'winston';
import expressWinston from 'express-winston';
import winstonPapertrail from 'winston-papertrail';


import config from './config';
import logget from './utils/logger';

const api = express();

api.use(cors());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

api.use(
    jwt({ secret: config.jwt.secret }).unless({
        path: [
            '/',
            '/auth/signup',
            '/auth/login',
            '/auth/forget-password',
            '/auth/reset-password',
        ]
    }),
);

// throw error if jwt is not passed in the request
api.use((err, req, res, next) => {
    if (err.name === 'UnauthorisedError') {
        res.status(401).send('Missing authentication credentials');
    }
});

api.use(
    expressWinston.logger({
        transports: [
            new winston.transports.Papertrail({
                host: config.logger.host,
                port: config.logger.port,
                level: 'error',
            }),
        ],
        meta: true
    }),  
);

api.listen(config.server.port, err => {
    if(err) {
        logger.error(err);
        process.exit(1);
    }

    require('./utils/db');

    fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
        require('./routes/' + file)(api);
    });

    logger.info(`API is now running on port ${config.server.port} in ${config.env} mode`);
});

module.exports = api;