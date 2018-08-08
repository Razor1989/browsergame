var express = require('express');
var app = express();
var router = express.Router();
var Server = require('http').Server(app);
var io = require('socket.io').listen(Server);
var bodyParser = require('body-parser');
var mysql = require('mysql');
var _ = require('lodash');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use('/',express.static(__dirname + '/client'));
app.use('/angular',express.static(__dirname + '/bower_components/angular'));
app.use('/angular-route',express.static(__dirname + '/bower_components/angular-route'));
app.use('/bower',express.static(__dirname + '/bower_components'));
app.use('/css',express.static(__dirname + '/css'));

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'bg'
});

connection.connect();

app.get('/', function (req, res) {
    res.sendFile(__dirname + 'client/index.html');
})

var players = [];

app.post('/login', function (req, res) {
    connection.query('SELECT * FROM user', function (error, results, fields) {
        results.forEach(function (value) {
            if (value.name === req.body.name && value.pass === req.body.pass) {
                console.log('Login accepted');
                var user = {
                    name: value.name,
                    id: value.id
                }
                res.json(user);
            }
        })
    });
})

io.on('connection', function (socket) {
    console.log('User connected');
    socket.on('disconnect', function () {
        console.log('User disconnected');
        socket.broadcast.emit('deletePlayer', socket.id);
    })
    socket.on('socketId', function (data) {
        socket.player = {
            name: data.name,
            id: data.id,
            socket: socket.id,
            x: 5,
            y: 5
        };
        socket.broadcast.emit('newPlayer', socket.player);
        socket.emit('allPlayers', getAllPlayers());
    })

    socket.on('move', function (data) {
        console.log('MOVE');
        var data = {
            path: data.path,
            x: data.x,
            y: data.y,
            socket: socket.id
        }
        socket.player.x = data.x;
        socket.player.y = data.y;
        io.emit('move', data);
    })
})

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketId) {
        var player = io.sockets.connected[socketId].player;
        if (player) players.push(player);
    })

    return players;
}


Server.listen(3000, function (err) {
    if (err) throw new err;
    console.log('Server läuft auf Port 3000');
})
