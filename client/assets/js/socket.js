const connectButton = document.getElementById('connect')
const disconnectButton = document.getElementById('disconnect')
const user = document.getElementById('user')
const pass = document.getElementById('pass')
const log = document.getElementById('log')

const sftpCrud = document.getElementById('sftpCrud')
const inPath = document.getElementById('inPath')
const returnPath = document.getElementById('returnPath')
const tblSftp = document.getElementById('tblSftp')
const formFileMultiple = document.getElementById('formFileMultiple')
const btnUpload = document.getElementById('btnUpload')

let PATH = ['/home/u466684088']
// let PATH = ['/home/u466684088/domains/jaudica.com/outbox']
 
const createPath = (option,data) => {
  // console.log(PATH);
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

const eventLog = (text) => {  
  log.textContent += `${text} \n `
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
  socket = new WebSocket('ws://172.20.2.57:4001')
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

    } else if (message.method === 'errorConnected') {
      eventLog(`Error: ${message.message}`)
      //!Aqui agregar cuando la sesión esta ocupada


    } else if (message.method === 'list') {
      listPath(message.objData)

    } else if (message.method === 'get') {     
      console.log('archivo descargado'); 
        const link = document.createElement('a');
        link.href = 'data:application/octet-stream;base64,' + message.fileData;
        link.download = message.fileName;
        link.click();    
    } else if (message.method === 'delete') { 
      alert(`Archivo ${message.fileName} eliminado`)

      socket.send(JSON.stringify(
        {
          type: 'list',
          path: createPath(0,PATH),
        }))
    }else if (message.method === 'upload') { 
      alert(`Archivo ${message.fileName} subido con exito`)

      socket.send(JSON.stringify(
        {
          type: 'list',
          path: createPath(0,PATH),
        }))
    }


    // eventLog(`Servidor: ${event.data}`) //cuando el servidor contesta

  });

}
 

disconnectButton.addEventListener('click', () => {
  socket.close();
});

const listPath = (data) => {
  sftpCrud.innerHTML = ""
  data.forEach(element => {
    let fileSizeInKB = element.size / 1024;
    let fileType
    let btnAccions = ''
    if (element.type === 'd') {
      fileType = `
        <i class="fa-regular fa-folder"></i> Carpeta ${element.name}
      `
    } else if (element.type === '-') {
      fileType = ` <i class="fa-regular fa-file"></i> Archivo ${element.name} `
      btnAccions = `
        <button type="button" class="btn btn-outline-primary"
        onclick ="handleClick('${element.name}',1)"
        >
        Descargar
        <i class="fa-solid fa-download"></i>
        </button>   
        <button type="button" class="btn btn-outline-danger"
        onclick ="handleClick('${element.name}',2)"
        >
        Eliminar
        <i class="fa-solid fa-trash"></i>
        </button>
        `

    }else{
      fileType = `
        <i class="fa-regular fa-folder"></i> Otro ${element.name}
      `
    }
    sftpCrud.innerHTML +=`
      <tr colspan="2" >        
        <td class="files" ondblclick ="handleOpenFolder('${element.name}')" >${fileType}</td>
        <td class="files" >
        ${ btnAccions }
        </td>
        <td>${formatDate(element.modifyTime)}</td>
        <td>${formatDate(element.accessTime)}</td>
        <td>${fileSizeInKB} KB</td>
      </tr>    
    `
  });
}
//!Descargar archivos
const handleClick = (data,opcion) => {
  switch (opcion) {
    case 1:
      console.log('descargando...');

      socket.send(JSON.stringify({
        type: 'get',
        file: data,
        path: createPath(0,PATH)
      }))
      break;
  case 2:
    socket.send(JSON.stringify({
      type: 'delete',
      file: data,
      path: createPath(0,PATH)
    }))
      break;
    default:
      break;
  }
  
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

 
btnUpload.addEventListener('click', (e) => {
  const files = formFileMultiple.files;
  const filesData = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function(event) {
      const fileContent = event.target.result;
      //  const base64Content = arrayBufferToBase64(fileContent);


      const fileData = {
        filename: file.name,
        fileContent: fileContent,
        type: 'upload',
        path: createPath(0, PATH)
      };
      filesData.push(fileData);
      if (filesData.length === files.length) {
        // Cuando se han procesado todos los archivos, enviarlos al servidor
        sendDataToServer(filesData);
      }
    };

    reader.readAsArrayBuffer(file);
  }
})
function sendDataToServer(data) {
  data.forEach(fileData => {
    const reader = new FileReader();
    reader.onload = function(event) {
      fileData.fileContent = event.target.result.split(',')[1]; // Solo obtenemos la parte base64
      socket.send(JSON.stringify(fileData));
    };
    reader.readAsDataURL(new Blob([fileData.fileContent])); // Convertimos el ArrayBuffer a Blob
  });
}

function arrayBufferToBase64(arrayBuffer) {
  const binary = new Uint8Array(arrayBuffer);
  return btoa(String.fromCharCode.apply(null, binary));
}
