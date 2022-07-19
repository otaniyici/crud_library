var mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, maxlength: 100 },
        family_name: { type: String, required: true, maxlength: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

AuthorSchema
    .virtual('date_of_birth_iso')
    .get(function () {
        return DateTime.fromJSDate(this.date_of_birth).toISODate();
    });

AuthorSchema
    .virtual('date_of_death_iso')
    .get(function () {
        return DateTime.fromJSDate(this.date_of_death).toISODate();
    });


// Virtual for author's full name
AuthorSchema
    .virtual('name')
    .get(function () {
        // To avoid errors in cases where an author does not have either a family name or first name
        // We want to make sure we handle the exceptions by returning an empty string for that case
        var fullname = '';
        if (this.first_name && this.family_name) {
            fullname = this.family_name + ', ' + this.first_name;
        }
        if (!this.first_name || !this.family_name) {
            fullname = ''
        }
        return fullname;
    });

// Virtual for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        var lifetime_string = '';
        if (this.date_of_birth) {
            lifetime_string += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
            // lifetime_string = this.date_of_birth.getFullYear().toString();
        }
        lifetime_string += ' - ';
        if (this.date_of_death) {
            lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
            // lifetime_string += this.date_of_death.getFullYear().toString();
        } else {
            lifetime_string += 'Present'
        }
        if (!this.date_of_birth && !this.date_of_death) {
            lifetime_string = "unknown";
        }
        return lifetime_string;
    });

// Virtual for author's URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

module.exports = mongoose.model('Author', AuthorSchema);