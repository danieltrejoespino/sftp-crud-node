const Client = require('ssh2-sftp-client');
const sftp = new Client();

async function handleSFTPCommand(ws, command) {
  try {
    switch (command.type) {
      case 'connect':
        console.log(command.type);
        await sftp.connect({
          host: command.host,
          port: command.port,
          username: command.username,
          password: command.password,
        });
        console.log(true);
        ws.send(JSON.stringify({ status: 'connected' }));

        break;
      case 'disconnect':
        await sftp.end();
        ws.send(JSON.stringify({ status: 'disconnected' }));
        ws.close();
        break;

      default:
        ws.send(JSON.stringify({ status: 'error', message: 'Unknown command type' }));

        break;
    }

  } catch (error) {
    ws.send(JSON.stringify({ status: 'error', message: error.message }));

  }

}

module.exports = { handleSFTPCommand };
