const socket = io.connect('/');
socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('response', (data) => {
  responseAlert(data.callerId, data.callerName, data.receiverId, data.receiverName);
});

function responseAlert(callerId, callerName, receiverId, receiverName) {
  const messageHtml = `${callerName}님이 대화에 초대했습니다. <br />
  <button type="button" class="accept" data-dismiss="alert" aria-label="accpet">수락</button>
  <button type="button" class="refuse" data-dismiss="alert" aria-label="refuse">거절</button>
  <span aria-hidden="true"></span>`;

  const alt = document.getElementById('customerAlert');
  if (alt) {
    alt.innerHTML = messageHtml;
  } else {
    const htmlTemp = `<div class="alert alert-sparta alert-dismissible show fade" role="alert" id="customerAlert">${messageHtml}</div>`;
    document.body.insertAdjacentHTML('beforeend', htmlTemp);
  }

  const acceptBtn = document.querySelector('.accept');
  const refuseBtn = document.querySelector('.refuse');

  acceptBtn.addEventListener('click', () => {
    acceptCall(callerId, callerName, receiverId, receiverName);
    acceptBtn.style.display = 'none';
    refuseBtn.style.display = 'none';
  });

  refuseBtn.addEventListener('click', () => {
    refuseBtn.style.display = 'none';
    acceptBtn.style.display = 'none';
  });

  setTimeout(() => {
    refuseBtn.style.display = 'none';
    acceptBtn.style.display = 'none';
  }, 60000);
}

// 응답 버튼을 누를 때 호출되는 함수
function acceptCall(callerId, callerName, receiverId, receiverName) {
  // socket.emit('createRoom', { callerId, callerName });
  const width = 1200;
  const height = 800;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // 새 창을 열어서 WebRTC 연결을 설정
  const callWindow = window.open(
    `/call?callerName=${callerName}&receiverName=${receiverName}`,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  callWindow.onload = () => {};
}
