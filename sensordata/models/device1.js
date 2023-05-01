const mongoose = require('mongoose');

module.exports = mongoose.model('Device', new mongoose.Schema({
    username: String,
    password: String,
    data: String,
    date: String,
    loadcelldata: String
}, { collection: 'sensor-data' }));