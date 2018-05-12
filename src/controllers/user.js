import async from 'async';
import validator from 'validator';

import User from '../models/user';

import logger from '../utils/logger';

// get all users
exports.list = (req, res) => {
    const query = req.query || {};

    User.apiQuery(query)
        .select('username email name')
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};

exports.get = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {};
    User.findById(data.user)
        .then(user => {
            user.password = undefined;
            user.recoveryCode = undefined;
            res.json(user);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};

// update
exports.put = (req, res) => {
    const data = Object.assign(req.body, { user: req.user.sub }) || {};
    if(data.email && !validator.isEmail(data.email)) {
        return res.status(422).send('Invalid email address.');
    }
    if(data.username && !validator.isAlphanumeric(data.username)) {
        return res.status(422).send('Usernames must be alphanumeric.');
    }

    User.findByIdAndUpdate({ _id: data.user }, data, { new: true })
        .then(user => {
            if(!user) return res.sendStatus(404);
            user.password = undefined;
            user.recoveryCode = undefined;
            res.jon(user);
        })
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};

// create new user
exports.post = (req, res) => {
    const data = Object.assign({}, req.body, { user: req.user.sub }) || {};
    User.create(data)
        .then(user => res.json(user))
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
}

exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.user._id)
        .then(user => res.json(user))
        .catch(err => {
            logger.error(err);
            res.status(422).send(err.errors);
        });
};