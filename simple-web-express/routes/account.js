var express = require('express');
var router = express.Router();
var User = require('../models/auth/user');
var {Customer} = require('../models/auth/customer');

router.get('/test', function (req, res) {
    console.log('Hello world!')
    res.render('index', { title: 'Express' });
});

/**
 * GET /register - Register the account
 */
router.post('/register', (req, res, next) => {
    console.log('REST request to register account')
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {
        console.log(`email: ${req.body.email}`)
        console.log(JSON.stringify(req.body, undefined, 2));
        var customer = new Customer({
            email: req.body.email
        });
        customer.save().then((doc) => {
            console.log(doc)
        })


        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        }

        //use schema.create to insert data into the db
        User.create(userData, function (err, user) {
            if (err) {
                return next(err)
            } else {
                return res.redirect('/');
            }
        });
    } else {
        // var err = new Error('Mandatory fields are missing')
        // err.status = 400;
        // return next(err);
        res.status(400).send(new Error('Mandatory fields are missing'));
    }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
                }
            }
        });
});

router.post('/login', (req, res, next) => {
    console.log("REST request to login")
    console.log(JSON.stringify(req.body, undefined, 2));
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, (error, user) => {
            if (error || !user) {
                var err = new Error('Incorrect email or password');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/');
            }
        });
    } else {
        var err = new Error('Mandatory fields are missing');
        err.status = 400;
        return next(err);
    }
})

// function requiresLogin(req, res, next) {
//     if (req.session && req.session.userId) {
//       return next();
//     } else {
//       var err = new Error('You must be logged in to view this page.');
//       err.status = 401;
//       return next(err);
//     }
//   }
//   router.get('/profile', mid.requiresLogin, function(req, res, next) {
//     //...
//   });

module.exports = router;
