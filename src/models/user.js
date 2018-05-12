import mongoose, { Schema } from 'mongoose';
import bcrypt from 'mongoose-bcrypt';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';

import logger from '../utils/logger';
import email from '../utils/email';
import event from '../utils/events';

export const UserSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true,
            bcrypt: true
        },
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
            required: true,
        },
        recoveryCode: {
            type: String,
            trim: true,
            default: '',
        }, 
        active: {
            type: Boolean,
            default: true,
        },
        admin: {
            type: Boolean,
            default: false
        },
    },
    { collection: 'users' },
);

UserSchema.pre('save', function(next){
    if(!this.isNew) {
        next();
    }

    email({
        type: 'welcome',
        email: this.email,
    })
    .then(() => {
        next();
    })
    .catch(err => {
        logger.error(err);
        next();
    });
});

UserSchema.pre('findOneAndUpdate', function(next){
    if(!this._update.recoveryCode) {
        return next();
    }

    email({
        type: 'password',
        email: this._conditions.email,
        passcode: this._update.recoveryCode,
    })
    .then(() => {
        next();
    })
    .catch(err => {
        logger.error(err);
        next();
    });
});

UserSchema.plugin(bcrypt);
UserSchema.plugin(timestamps);
UserSchema.plugin(mongooseStringQuery);
UserSchema.index({ email: 1, username: 1}); 

module.exports = exports = mongoose.model('User', UserSchema);