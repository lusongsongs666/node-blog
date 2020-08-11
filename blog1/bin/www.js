require('events').EventEmitter.defaultMaxListeners = 0;

const http = require('http');

const port = 8000;

const serverHandle = require('../app');

const server = http.createServer(serverHandle);

server.listen(port);


