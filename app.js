const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://rmk9:linkin96ralf86@ds255309.mlab.com:55309/videa_db')
.then(() => console.log('Connected to db.'))
.catch(err => console.error(err));

require('./models/note');
const Note = mongoose.model('notes');

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/notes', (req, res) => {
    Note.find({})
    .sort({ date: 'desc' })
    .then(notes => {
        res.render('notes/index', {
            notes: notes
        });
    })
    
});

app.post('/notes', (req, res) => {
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

app.get('/notes/add', (req, res) => {
    res.render('notes/add');
});

app.get('/notes/edit/:id', (req, res) => {
    Note.findOne({
        _id: req.params.id
    }).then(note => {
        res.render('notes/edit', {
            note: note
        });
    });
});

app.put('/notes/:id', (req, res) => {
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

app.delete('/notes/:id', (req, res) => {
    Note.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Note removed.');
        res.redirect('/notes');
    })
});

const port = 9310;

app.listen(port, () => {
    console.log(`server on ${port}`);
});