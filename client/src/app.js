const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const base_dir = app.getPath('exe');
const PROTO_PATH = path.join(__dirname, 'file_transfer.proto'); 
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});


let addr = fs.readFileSync(path.join(base_dir, '..', "addr.txt"), "UTF8");
const fileTransferProto = grpc.loadPackageDefinition(packageDefinition).filetransfer;
const client = new fileTransferProto.FileTransferService(addr, grpc.credentials.createInsecure());


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true
    }      
  });

  win.loadFile('index.html');
}

ipcMain.on('get-path', (event) => {
  const path = app.getPath('exe');
  event.reply('get-path-reply', path)
});


ipcMain.on('request-file-transfer', (event, filename) => {
  const call = client.transferFile({ filename });

  const downloadDir = path.join(base_dir, '..', 'downloaded');

  if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
  }

  const filePath = path.join(downloadDir, filename);
  const writeStream = fs.createWriteStream(filePath);

  call.on('data', (chunk) => {
      writeStream.write(chunk.content);
  });

  call.on('end', () => {
      event.sender.send('file-transfer-completed', filename);
  });

});


app.whenReady().then(createWindow);