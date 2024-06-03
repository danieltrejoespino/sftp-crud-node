const WebSocket = require('ws');
const { handleWebSocketConnection } = require('./src/websocketHandler');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', handleWebSocketConnection);

console.log('WebSocket server started on ws://localhost:8080');