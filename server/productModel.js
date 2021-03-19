const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    url: String,
    image: String,
    delivery: String,
    price: String,
})


module.exports = mongoose.model('Product', productSchema);