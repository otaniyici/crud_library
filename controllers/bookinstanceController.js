async = require('async');
const { body, validationResult } = require("express-validator");
const { DateTime } = require('luxon');

var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res) {

    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return nextTick(err); }
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance == null) { // No results.
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
        })

};


// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {

    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }
            // Successful, so render
            bookinstance_status = BookInstance.schema.path('status').enumValues;
            res.render('bookinstance_form', {
                title: 'Create BookInstance', book_list: books,
                bookinstance_status: bookinstance_status
            })
        });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitize fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        //Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    res.render('bookinstance_form', {
                        title: 'Create BookInstance', book_list: books, due_back: due_back,
                        selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance
                    });
                });
            return;
        }
        else {
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                res.redirect(bookinstance.url);
            })
        }
    }

]
// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
    BookInstance.findById(req.params.id, function (err, result) {
        if (err) { return next(err); }
        res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: result });
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res, next) {

    BookInstance.findByIdAndRemove(req.params.id, function deleteBookInstance(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/bookinstances')
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {

    async.parallel({
        book_list: function (callback) {
            Book.find({}, 'title').exec(callback);
        },
        bookinstance: function (callback) {
            BookInstance.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        // Successful, so render
        bookinstance_status = BookInstance.schema.path('status').enumValues;
        due_back = DateTime.fromJSDate(results.bookinstance.due_back).toISODate();
        res.render('bookinstance_form', {
            title: 'Update BookInstance', book_list: results.book_list, bookinstance: results.bookinstance,
            bookinstance_status: bookinstance_status, selected_book: results.bookinstance.book._id, due_back: due_back
        })
    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Validate and sanitize fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        //Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance({
            _id: req.params.id,
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    res.render('bookinstance_form', {
                        title: 'Create BookInstance', book_list: books, due_back: due_back,
                        selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance
                    });
                });
            return;
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
                if (err) { return next(err); }
                res.redirect(thebookinstance.url);
            })
        }
    }
]
