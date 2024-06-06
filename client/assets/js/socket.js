const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')

const sftpCrud = document.getElementById('sftpCrud')
const inPath = document.getElementById('inPath')
const returnPath = document.getElementById('returnPath')
const tblSftp = document.getElementById('tblSftp')

let PATH = ['/home/u466684088']
// let PATH = ['/home/u466684088/domains/jaudica.com/outbox']
 
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
    returnPath.hidden = true
    tblSftp.hidden = true

  });

  socket.addEventListener('error', (error) => {
    eventLog(`Error: ${error.message}`)
    
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.method === 'connected') {
      returnPath.hidden = false
      tblSftp.hidden = false
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

const listPath = (data) => {
  sftpCrud.innerHTML = ""
  data.forEach(element => {
    let fileSizeInKB = element.size / 1024;
    let fileType
    if (element.type === 'd') {
      fileType = `
        <i class="fa-regular fa-folder"></i> Carpeta ${element.name}
      `
    } else if (element.type === '-') {
      fileType = `
        <i class="fa-regular fa-folder"></i> Archivo ${element.name}
      `
    }else{
      fileType = `
        <i class="fa-regular fa-folder"></i> Otro ${element.name}
      `
    }
    sftpCrud.innerHTML +=`
      <tr colspan="2" >        
        <td class="files" ondblclick ="handleOpenFolder('${element.name}')" >${fileType}</td>
        <td>${formatDate(element.modifyTime)}</td>
        <td>${formatDate(element.accessTime)}</td>
        <td>${fileSizeInKB} KB</td>
      </tr>    
    `


    // if (element.type === 'd') {
    //   // console.log(`Directory: ${element.name}`);
    //   sftpCrud.innerHTML += `<p class="files" onclick="handleOpenFolder('${element.name}')">
    //   <i class="fa-regular fa-folder"></i>
    //   Carpeta ${element.name} Tama&ntilde;o ${fileSizeInKB} KB  Ultima modificacion: ${formatDate(element.modifyTime)}   Ultima acceso: ${formatDate(element.accessTime)}
    //     </p>`
    // } else if (element.type === '-') {
    //   // console.log(`File: ${element.name}`);
    //   sftpCrud.innerHTML += `<p class="files" onclick="handleClick('${element.name}')">
    //   <i class="fa-regular fa-file"></i>
    //   Archivo ${element.name} Tama&ntilde;o ${fileSizeInKB} KB  Ultima modificacion: ${formatDate(element.modifyTime)}   Ultima acceso: ${formatDate(element.accessTime)}
    //     </p>`
    // }
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

returnPath.addEventListener('dblclick', (e) => {
  createPath(2,0)

  socket.send(JSON.stringify(
    {
      type: 'list',
      path: createPath(0,PATH),
    }))
})



const formatDate = (accessTime) => {
  const fechaAcceso = new Date(accessTime);

  // Obtener los componentes de la fecha y la hora
  const dia = fechaAcceso.getDate().toString().padStart(2, '0');
  const mes = (fechaAcceso.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
  const anio = fechaAcceso.getFullYear();
  const horas = fechaAcceso.getHours().toString().padStart(2, '0');
  const minutos = fechaAcceso.getMinutes().toString().padStart(2, '0');
  const segundos = fechaAcceso.getSeconds().toString().padStart(2, '0');
  const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  return fechaFormateada
}