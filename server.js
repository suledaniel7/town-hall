const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cors = require('cors');
const favicon = require('serve-favicon');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const router = require('./server/router');
const api = require('./server/api');
const socket = require('./server/socket');

app.use(cors());

mongoose.connect('mongodb://127.0.0.1/town_hall', { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }).catch((reason) => {
    console.log(`Couldn't connect to MongoDB. Reason: ${reason}`);
});

io.on('connection', socket);
app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

app.use('/', router);
app.use('/api', api);

http.listen(8095, () => {
    console.log("Server running at http://127.0.0.1:8095");
});