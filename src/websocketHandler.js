const { handleSFTPCommand } = require('./sftpHandler');

function handleWebSocketConnection(ws,req) {
  ws.on('message', async function incoming(accions) {
    const ip = req.socket.remoteAddress;

    const command = JSON.parse(accions);

    console.log(`Received command: ${command.type} - ${ip}`);
    await handleSFTPCommand(ws, command);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

module.exports = { handleWebSocketConnection };