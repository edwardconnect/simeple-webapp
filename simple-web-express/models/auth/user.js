var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';

    var token = jwt.sign({ _id: user._id, access }, 'secret').toString();

    user.tokens.push({ access, token });
    const result = user.save().then(() => {
        return token;
    });
    console.log(result);
    return result;
}

UserSchema.methods.toJSON = function () {
    const user = this;
    return {
        _id: user._id,
        email: user.email
    }
}

UserSchema.statics.findByToken = function (token) {
    let decoded;

    try {
        decoded = jwt.verify(token, 'secret');
    } catch (e) {
        return Promise.rejected()
    }
    console.log(`Decoded: ${decoded}`)
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    // console.log(User.findOne({ 'email': email }));
    return User.findOne({ 'email': email }).then((user) => {
            if (!user) {
                return Promise.reject(undefined);
            }

            // bcrypt.compare(password, user.password, (err, res) => {
            //     if (res) {
            //         return user;
            //     } else {
            //         return Promise.reject();
            //     }
            // })
            return user;
            // return new Promise()
            // return new Promise((resolve, reject) => {
            //     console.log('Promise')
            //     bcrypt.compare(password, user.password, (err, res) => {
            //         console.log('res: ' + res)
            //         if (res) {
            //             resolve(user);
            //         } else {
            //             reject('a')
            //             // resolve(user);
            //             // reject();
            //         }
            //     })
            // })
        })
}

UserSchema.pre('save', function (next) {
    const user = this;

    if (user.isModified('password')) {

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next()
            });
        });
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;