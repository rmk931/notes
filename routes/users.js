const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//require('../models/note');
//const Note = mongoose.model('notes');

router.get('/register', (req, res) => {
    res.send('register');
});

router.get('/login', (req, res) => {
    res.send('login');
});

module.exports = router;