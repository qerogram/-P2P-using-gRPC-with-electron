const client = window._client

const listFiles = () => {
  client.ListFiles({}, (error, response) => {
    if (error) {
      console.error(error);
      return;
    }

    const filesListTable = document.getElementById('files-list').getElementsByTagName('tbody')[0];
    filesListTable.innerHTML = ''; // 테이블 초기화
    response.filenames.forEach((filename, index) => {
      const row = filesListTable.insertRow();
      const selectCell = row.insertCell(0);
      const nameCell = row.insertCell(1);
      selectCell.innerHTML = `<input class="form-check-input" type="checkbox" name="fileSelect" value="${filename}">`;
      nameCell.textContent = filename;
    });
  });
}

client.onFileTransferCompleted((filename) => {
  const LogsListTable = document.getElementById('log-list').getElementsByTagName('tbody')[0];

  const row = LogsListTable.insertRow();
  const selectCell = row.insertCell(0);
  selectCell.innerHTML = `[시스템] ${filename} 파일 다운로드가 완료되었습니다.`;
});

const downloadSelectedFiles = () => {
  const selectedFiles = document.querySelectorAll('input[name="fileSelect"]:checked');

  selectedFiles.forEach((fileInput) => {
    const filename = fileInput.value;
    client.requestFileTransfer(filename);
  }); 
}



document.getElementById('checkAll').addEventListener('change', function() {
  const isChecked = this.checked;
  const checkboxes = document.querySelectorAll('input[name="fileSelect"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
});

document.getElementById('download').addEventListener('click', downloadSelectedFiles);

window.onload = listFiles;