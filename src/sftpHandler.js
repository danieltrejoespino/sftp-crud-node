const Client = require('ssh2-sftp-client');
const sftp = new Client();

async function handleSFTPCommand(ws, command) {
  try {
    switch (command.type) {
      case 'connect':
        console.log('Attempting to connect');
        await sftp.connect({
          host: command.host,
          port: command.port,
          username: command.username,
          password: command.password,
        });
        console.log('Connected');
        ws.send(JSON.stringify({ status: 'success', method : 'connected' }));
        break;

      case 'disconnect':
        console.log('Disconnecting');
        await sftp.end();
        ws.send(JSON.stringify({ status: 'disconnected' }));
        ws.close();
        break;

      case 'list':
        console.log('Listing directory:', command.path);
        const data = await sftp.list(command.path);
        console.log(data);
        ws.send(JSON.stringify({ status: 'success', method : 'list', objData: data }));
        break;

      case 'get':
        console.log('Getting file:', command.file);

        let remoteFilePath = `${command.path}/${command.file}`;

        const objGet = await sftp.get(remoteFilePath);        
        // await sftp.get(remoteFilePath, `public/${command.file}`);
        ws.send(JSON.stringify({ status: 'success', method : 'get', data: objGet.toString('base64'), filename: `${command.file}.csv` }));

        // ws.send(JSON.stringify({ status: 'get', data: 'File downloaded successfully' }));
        break;

      default:
        console.log('Unknown command type:', command.type);
        ws.send(JSON.stringify({ status: 'error', message: 'Unknown command type' }));
        break;
    }
  } catch (error) {
    console.log('Error handling command:', error);
    ws.send(JSON.stringify({ status: 'error', message: error.message }));
  }
}

module.exports = { handleSFTPCommand };
