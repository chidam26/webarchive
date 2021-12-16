const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        link: {type: String, required: true},
        description: {type: String, required: true},
        user: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "model"
        }
    }
)

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry