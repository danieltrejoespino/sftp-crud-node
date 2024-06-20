const Client = require("ssh2-sftp-client");
const sftp = new Client();
const fs = require("fs");
const path = require("path");

async function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  await fs.promises.mkdir(dirname, { recursive: true });
}

async function handleSFTPCommand(ws, command) {
  try {
    switch (command.type) {
      case "connect":
        console.log("Attempting to connect");
        try {
          await sftp.connect({
            host: command.host,
            port: command.port,
            username: command.username,
            password: command.password,
          });
          console.log("Connected");
          ws.send(JSON.stringify({ status: "success", method: "connected" }));
        } catch (error) {
          console.log("ddddd");
          console.log(error);
          ws.send(JSON.stringify({ status: "error",method: "errorConnected", message: error.message }));

        }

        break;

      case "disconnect":
        console.log("Disconnecting");
        await sftp.end();
        ws.send(JSON.stringify({ status: "disconnected" }));
        ws.close();
        break;

      case "list":
        const data = await sftp.list(command.path);
        ws.send(
          JSON.stringify({ status: "success", method: "list", objData: data })
        );
        break;

      case "get":
        console.log("Getting file:", command.file);
        let remoteFilePath = `${command.path}/${command.file}`;
        const fileData = await sftp.get(remoteFilePath);
        const base64FileData = fileData.toString("base64");
        const fileName = remoteFilePath.split("/").pop();
        ws.send(
          JSON.stringify({
            status: "success",
            method: "get",
            fileName: fileName,
            fileData: base64FileData,
          })
        );
        break;

      case "delete":
        let deletePath = `${command.path}/${command.file}`;
        await sftp.delete(deletePath);
        ws.send(
          JSON.stringify({
            status: "success",
            method: "delete",
            fileName: command.file,
          })
        );
        break;

      case "upload":
        const uploadPath = `${command.path}/${command.filename}`;
        await ensureDirectoryExistence(uploadPath);
        const fileContent = Buffer.from(command.fileContent, "base64");
        await sftp.put(fileContent, uploadPath);
        ws.send(
          JSON.stringify({
            status: "success",
            method: "upload",
            fileName: command.filename,
          })
        );
        break;

      default:
        console.log("Unknown command type:", command.type);
        ws.send(
          JSON.stringify({ status: "error", message: "Unknown command type" })
        );
        break;
    }
  } catch (error) {
    console.log("Error handling command:", error);
    ws.send(JSON.stringify({ status: "error", message: error.message }));
  }
}

module.exports = { handleSFTPCommand };
