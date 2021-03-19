const express = require('express');
const app = express();
const cors = require('cors')
const ProductModel = require('./productModel');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crawlo', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection;
db.on('connecting', () => console.error('connection connecting ...'))
db.on('open', () => console.log('connected successfully ~'))
db.on('error', (e) => console.error('connection error:', e))
app.use(cors());

app.get('/', async (req, res) => {
    const products = await ProductModel.find({});
    res.send(products);
})

app.listen(3001,()=>{
  console.log('server running on port 3001')
});