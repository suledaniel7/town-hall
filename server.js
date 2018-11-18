const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cors = require('cors');

const router = require('./server/router');
const api = require('./server/api');

const app = express();
app.use(cors());

mongoose.connect('mongodb://127.0.0.1/town_hall');

app.use(express.static(__dirname+'/public/'));

app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');

app.use('/', router);
app.use('/api', api);

app.listen(8080, ()=>{
    console.log("Server running at http://127.0.0.1:8080");
});