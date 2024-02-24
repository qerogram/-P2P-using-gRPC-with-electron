const { app, contextBridge, ipcRenderer } = require('electron');

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');


const protoPath = path.join(__dirname, 'file_transfer.proto');

contextBridge.exposeInMainWorld('electron', {
    protoPath: protoPath,
});

  
const packageDefinition = protoLoader.loadSync(protoPath, {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});


const getPath = () => {
    return new Promise((resolve, reject) => {
        ipcRenderer.send('get-path');
    
        ipcRenderer.once('get-path-reply', (event, path) => {
          console.log('System path:', path);
          resolve(path); 
        });
    
        ipcRenderer.on('get-path-error', (event, error) => {
          console.error('Error getting path:', error);
          reject(error); 
        });
      });
  }


  
let base_dir = ''

getPath().then((path) => {
    base_dir = path
});


let addr = fs.readFileSync(path.join(base_dir, "addr.txt"), "UTF8");
const fileTransferProto = grpc.loadPackageDefinition(packageDefinition).filetransfer;
const client = new fileTransferProto.FileTransferService(addr, grpc.credentials.createInsecure());


contextBridge.exposeInMainWorld('_client', {
    ListFiles: (args, callback) => {
        return client.ListFiles(args, callback);
    },
    transferFile: (filename) =>  {
        return client.transferFile(filename)
    },

    requestFileTransfer: (filename) => ipcRenderer.send('request-file-transfer', filename),
    onFileTransferCompleted: (callback) => ipcRenderer.on('file-transfer-completed', (event, ...args) => callback(...args))

});