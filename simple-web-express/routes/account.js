var express = require('express');
var router = express.Router();
var User = require('../models/auth/user');

var authenticate = (req, res, next) => {
    // console.log(JSON.stringify(req, undefined, 2))
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        console.log('fonud')
        console.log(user)
        req.body.user = user;
        req.body.token = token;
        next();
    }).catch((e) => {
        res.status(401).send(e);
    })
}

router.post('/register', (req, res) => {
    console.log(req.body)
    var user = new User({
        email: req.body.email,
        password: req.body.password
    });

    user.save().then((savedUser) => {
        return savedUser.generateAuthToken()
    }).then((token) => {
        console.log(`Token: ${token}`);
        res.status(201).header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e)
    })
})

router.get('/me', authenticate, (req, res) => {
    console.log('REST quest')
    res.send(req.body);
})

router.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        // const user = User.findOne({'email': req.body.email}).then((user) => {
        //     return new Promise((resolve, reject) => {
        //         resolve(user)
        //     });
        // })
        // console.log(user);
        // User.findByCredentials(req.body.email, req.body.password).then((user) => {
        //         res.header('x-auth', token).send(user)
        //     }).catch((e) => {
        //         console.log(e)
        //         res.status(401).send(e);
        //     })
        console.log(User.findByCredentials(req.body.email, req.body.password))
        // User.findByCredentials(req.body.email, req.body.password)
        // .then((res) => console.log(res))
        // .catch((e) => res.status(401).send())
        // .catch((error) => res.status)
    } else {
        res.status(400).send('Mandatory fields are missing.');
    }
})

module.exports = router;
