var mongoose = require('mongoose');
var Customer = mongoose.model('Customer',   {
    email: {
        type: String
    }
});

module.exports = {Customer};