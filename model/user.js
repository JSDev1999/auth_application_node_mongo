let mongoose = require('mongoose');
var Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');

let validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

let UserSchema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { type: String, required: true },
    emailverify: { type: Boolean, required: true },
});

UserSchema.plugin(timestamps);

let User = new mongoose.model('user', UserSchema);

module.exports = User;