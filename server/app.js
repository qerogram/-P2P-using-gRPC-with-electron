const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');

// Proto 파일 로드
const PROTO_PATH = './file_transfer.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const fileTransferProto = grpc.loadPackageDefinition(packageDefinition).filetransfer;


// ListFiles 메서드 구현
function listFiles(call, callback) {
  const filesDir = path.join(__dirname, 'files');
  fs.readdir(filesDir, (err, files) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, { filenames: files });
  });
}

// 파일 전송 구현
function transferFile(call) {
  const { filename } = call.request;
  const filePath = path.join(__dirname, 'files', filename); // 'files' 폴더 내의 파일 경로
  const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 * 64 }); // 64KB씩 읽기

  readStream.on('data', (chunk) => {
    call.write({ content: chunk });
  });

  readStream.on('end', () => {
    call.end();
  });
}

// 서버 초기화
function main() {
  const server = new grpc.Server();
  server.addService(fileTransferProto.FileTransferService.service, { TransferFile: transferFile, ListFiles: listFiles });
  server.bindAsync('0.0.0.0:8282', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running at http://0.0.0.0:8282');
    server.start();
  });
}

main();
