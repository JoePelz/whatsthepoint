const express = require('express');
const path = require('path');
const app = express();

const http = require('http');
const server = http.Server(app);

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'build')));

let locations = {};

const locationTtl = 30 * 1000 // 30 sec in ms

io.on('connection', (socket) => {
  io.emit('messages', locations);
  socket.on('message', (locationData) => {
    locationData['lastUpdate'] = new Date();
    locations[socket.id] = locationData;
    io.emit('messages', locations);
  });
});

setInterval(() => {
  Object.keys(locations).forEach((key) => {
    if (((new Date()) - locations[key].lastUpdate) > locationTtl) {
      delete locations[key];
    }
  });
}, 1000);

let port = process.env.PORT
if (port == null || port == "") {
  port = '5000';
}

server.listen(port, () => {
  console.log('Server running on port ' + port);
});
