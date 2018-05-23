const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

require('../models/user');
const User = mongoose.model('users');

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/notes',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/register', (req, res) => {
    let errors = [];

    if(req.body.password != req.body.confirmPassword){
        errors.push({text:'Passwords do not match'});
    }

    if(req.body.password.length < 6){
        errors.push({text:'Password must be at least 6 characters'});
    }

    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });
    } else {
      User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                req.flash('error_msg', 'Email already regsitered');
                res.redirect('/users/register');
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                          req.flash('success_msg', 'You are now registered and can log in');
                          res.redirect('/users/login');
                        })
                    .catch(err => {
                      console.log(err);
                      return;
                    });
                });
              });
            }
        });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logout successfuly');
    res.redirect('/users/login');
});

module.exports = router;