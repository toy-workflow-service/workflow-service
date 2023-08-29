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
    socket.emit('createRoom', { callerId, receiverId, callerName, receiverName });
    acceptBtn.style.display = 'none';
    refuseBtn.style.display = 'none';
    videoCall('/call', '영상 통화');
  });

  // refuseBtn.addEventListener('click', () => {});

  // setTimeOut(() => {}, 60000);
}
