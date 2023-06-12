let mongoose = require('mongoose');
var Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp');

let validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

let OtpSchema = new Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    otp: { type: Number, required: true },
    used: {
        type: Boolean
    }
});

OtpSchema.plugin(timestamps);

let Otp = new mongoose.model('otp', OtpSchema);

module.exports = Otp;