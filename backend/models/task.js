const mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const taskSchema = new Schema ({
    description: { type: String, required: true },
    date: { type: Date, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Task', taskSchema);