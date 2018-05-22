const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

require('../models/note');
const Note = mongoose.model('notes');

router.get('/', (req, res) => {
    Note.find({})
    .sort({ date: 'desc' })
    .then(notes => {
        res.render('notes/index', {
            notes: notes
        });
    })
    
});

router.post('/', (req, res) => {
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
        }
        new Note(newNote).save().then(note => {
            req.flash('success_msg', 'Note added.');
            res.redirect('/notes');
        });
    }
});

router.get('/add', (req, res) => {
    res.render('notes/add');
});

router.get('/edit/:id', (req, res) => {
    Note.findOne({
        _id: req.params.id
    }).then(note => {
        res.render('notes/edit', {
            note: note
        });
    });
});

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
    Note.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Note removed.');
        res.redirect('/notes');
    })
});

module.exports = router;