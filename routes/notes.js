const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth'); 

require('../models/note');
const Note = mongoose.model('notes');

router.get('/', ensureAuthenticated, (req, res) => {
    Note.find({user: req.user.id})
    .sort({ date: 'desc' })
    .then(notes => {
        res.render('notes/index', {
            notes: notes
        });
    })
    
});

router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Add title!' });
    }
    if (!req.body.text) {
        errors.push({ text: 'Add text!' });
    }

    if (errors.length > 0) {
        res.render('notes/add', {
            errors: errors,
            title: req.body.title,
            text: req.body.text
        })
    } else {
        const newNote = {
            title: req.body.title,
            text: req.body.text,
            user: req.user.id
        }
        new Note(newNote).save().then(note => {
            req.flash('success_msg', 'Note added.');
            res.redirect('/notes');
        });
    }
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('notes/add');
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Note.findOne({
        _id: req.params.id
    }).then(note => {
        if (note.user != req.user.id) {
            req.flash('error_msg', 'not authorized');
            res.redirect('/ideas');
        } else {
            res.render('notes/edit', {
                note: note
            });
        }
    });
});

router.put('/:id', ensureAuthenticated, (req, res) => {
    Note.findOne({
        _id: req.params.id
    }).then(note => {
        note.title = req.body.title;
        note.text = req.body.text;

        note.save().then(note => {
            req.flash('success_msg', 'Note updated.');
            res.redirect('/notes');
        });
    })
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Note.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Note removed.');
        res.redirect('/notes');
    })
});

module.exports = router;