const tmi = require('tmi.js');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const serveStatic = require('serve-static');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(serveStatic(__dirname + '/public'));

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

// Define configuration options
const opts = {
    identity: {
        username: "killsyourbuzz",
        password: "oauth:yxqtmwxbk8eyd1m15mmoh155oacx3c"
    },
    channels: [
        "thesushidragon"
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (channel, user, message, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = message.trim();

    io.emit('chat message', {msg: message, mod: isOwnerOrMod(channel, user), username: user.username});
}

function isOwnerOrMod(channel, user) {
    return user.mod || channel.substring(1, channel.length) === user.username;
}

// Function called when the "dice" command is issued
function rollDice () {
    const sides = 6;
    return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}