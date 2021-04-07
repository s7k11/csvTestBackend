let mongoose = require('mongoose')
let queries = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    imageArr: [
        {
            mailImgUrl: String,
            thumbImgUrl: String
        }
    ]
});
module.exports = mongoose.model('Queries', queries)