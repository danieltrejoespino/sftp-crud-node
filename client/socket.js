const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const messageInput = document.getElementById('message')
const sendButton = document.getElementById('send')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')
const sftpCrud = document.getElementById('sftpCrud')
const inPath = document.getElementById('inPath')

connectButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (user.value.trim() || pass.value.trim()) {
    openSocket()
  } else {
    console.log('sin datos');
  }

})

const openSocket = () => {
  socket = new WebSocket('ws://localhost:8080')
  socket.addEventListener('open', () => {

    socket.send(
      JSON.stringify({
        type: 'connect',
        host: '195.179.238.13',
        port: 65002,
        username: 'u466684088',
        password: 'D123#$%67q'
      })
    );
    connectButton.disabled = true
    disconnectButton.disabled = false;
    messageInput.disabled = false;
    sendButton.disabled = false;
  })

  socket.addEventListener('close', () => {
    eventLog('Desconectado del servidor')
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    messageInput.disabled = true;
    sendButton.disabled = true;
  });

  socket.addEventListener('error', (error) => {
    eventLog(`Error: ${error.message}`)
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.status === 'connected') {
      eventLog(`Conexion sftp establecida`)
      socket.send(JSON.stringify({ type: 'list', path: inPath.value, }))

    } else if (message.status === 'error') {
      eventLog(`Error: ${message.message}`)
    } else if (message.status === 'list') {
      listPath(message.objData)
    } else if (message.status === 'get') {
      console.log(message);
    }

    eventLog(`Servidor: ${event.data}`) //cuando el servidor contesta

  });

}

const eventLog = (text) => {
  log.textContent += `${text} \n `
}

disconnectButton.addEventListener('click', () => {
  socket.close();
});

sendButton.addEventListener('click', () => {
  // const message = messageInput.value;

  // socket.send(message);

  eventLog(`Cliente: ${message}`)
  messageInput.value = '';
});


const listPath = (data) => {
  data.forEach(element => {
    if (element.type === 'd') {
      console.log(`Directory: ${element.name}`);
      sftpCrud.innerHTML += `<p>Carpeta ${element.name}</p>`
    } else if (element.type === '-') {
      console.log(`File: ${element.name}`);
      sftpCrud.innerHTML += `<p onclick="handleClick('${element.name}')">Archivo ${element.name}</p>`
    }
  });
}

const handleClick = (data) => {
  socket.send(JSON.stringify({
     type: 'get',
     file: data,
     path: inPath.value 
    }))
};
