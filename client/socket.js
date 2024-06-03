const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const messageInput = document.getElementById('message')
const sendButton = document.getElementById('send')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')
const sftpCrud = document.getElementById('sftpCrud')

connectButton.addEventListener('click',(e)=>{
  e.preventDefault();
  if(user.value.trim() || pass.value.trim()) {
    console.log('con datos');
    openSocket()
  }else{
    console.log('sin datos');
  }

})

const openSocket = () => {
  socket = new WebSocket('ws://localhost:8080')
  socket.addEventListener('open',()=> {

    socket.send(
      JSON.stringify({
        type: 'connect',
        host: '195.179.238.13',
        port: 65002,
        username: 'u466684088',
        password: 'D123#$%67q'
      })
    );
    eventLog('Conectado al servidor')
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