const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function (req, res) {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genres) {
            if (err) return next(err);
            list_genres.forEach(function (i) {
                console.log(i.name);
            });
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
    //  var id = mongoose.Types.ObjectId(req.params.id);
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id }).exec(callback);
        }

    }, function (err, results) {
        if (err) return next(err);

        if (results.genre == null) {
            let err = new Error('Genre not found!');
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });

    });



};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    } else {

                        genre.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        genre: function(callback){
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback){
            Book.find({'genre': req.params.id}).exec(callback);
        }
    }, function(err, results){
        if(err) return next(err);
        if(results.genre == null){
            res.redirect('/catelog/genres');
        }
        console.log("test.............");
        res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
    // res.send('NOT IMPLEMENTED: Genre delete POST');

    async.parallel({
        genre: function(callback){
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function(callback){
            Book.find({'genre': req.body.genreid}).exec(callback);
        }
    }, function(err, results){
        if(err) return next(err);

        if(results.genre_books.length > 0){
            res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, genre_books: result.genre_books});
            return;
        } else{
            Genre.findByIdAndRemove(req.body.genreid, function(err){
                if(err) return next(err);
                res.redirect('/catalog/genres');
            });

        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};