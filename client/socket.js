const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')

const sftpCrud = document.getElementById('sftpCrud')
const inPath = document.getElementById('inPath')
const returnPath = document.getElementById('returnPath')

let PATH = ['/home/u466684088']
// let PATH = ['/home/u466684088/domains/jaudica.com/outbox']

console.log(PATH.length);
 
const createPath = (option,data) => {
  console.log(PATH);
  switch (option) {
    case 1:
      PATH.push(data);
      inPath.value = PATH.join('/')
      return PATH.join('/');
    case 2:
      if (PATH.length != 1) {
        PATH.pop();
      }else{
        alert('Ya estas en la carpeta raiz')
      }

      inPath.value = PATH.join('/')
      return PATH.join('/');
    default:
      inPath.value = PATH.join('/')
      return PATH.join('/')
  }
}
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

  })

  socket.addEventListener('close', () => {
    eventLog('Desconectado del servidor')
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sftpCrud.innerHTML = ""

  });

  socket.addEventListener('error', (error) => {
    eventLog(`Error: ${error.message}`)
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.method === 'connected') {
      eventLog(`Conexion sftp establecida`)
      socket.send(JSON.stringify({ type: 'list', path: createPath(0,PATH) }))

    } else if (message.method === 'error') {
      eventLog(`Error: ${message.message}`)

    } else if (message.method === 'list') {
      listPath(message.objData)

    } else if (message.method === 'get') {      
      const link = document.createElement('a');
      link.href = 'data:text/csv;base64,' + message.data;
      link.download = message.filename || 'file.csv';
      link.click();
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

// sendButton.addEventListener('click', () => {
//   // const message = messageInput.value;

//   // socket.send(message);

//   eventLog(`Cliente: ${message}`)
//   messageInput.value = '';
// });


const listPath = (data) => {
  sftpCrud.innerHTML = ""
  data.forEach(element => {
    if (element.type === 'd') {
      // console.log(`Directory: ${element.name}`);
      sftpCrud.innerHTML += `<p onclick="handleOpenFolder('${element.name}')">Carpeta ${element.name}</p>`
    } else if (element.type === '-') {
      // console.log(`File: ${element.name}`);
      sftpCrud.innerHTML += `<p onclick="handleClick('${element.name}')">Archivo ${element.name}</p>`
    }
  });
}
//!Descargar archivos
const handleClick = (data) => {
  socket.send(JSON.stringify({
    type: 'get',
    file: data,
    path: createPath(0,PATH)
  }))
};


const handleOpenFolder = (data) => {
  createPath(1,data)

  socket.send(JSON.stringify(
    {
      type: 'list',
      path: createPath(0,PATH),
    }))

};

returnPath.addEventListener('click', (e) => {
  createPath(2,0)

  socket.send(JSON.stringify(
    {
      type: 'list',
      path: createPath(0,PATH),
    }))
})
