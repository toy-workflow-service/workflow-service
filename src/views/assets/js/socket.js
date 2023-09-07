const socket = io.connect('/');

socket.on('response', (data) => {
  responseAlert(data.callerName, data.receiverName);
});

function responseAlert(callerName, receiverName) {
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
    acceptCall(callerName, receiverName);
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
function acceptCall(callerName, receiverName) {
  const width = 800;
  const height = 900;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // 새 창을 열어서 WebRTC 연결을 설정
  const callWindow = window.open(
    `/call?callerName=${callerName}&receiverName=${receiverName}`,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  callWindow.onload = () => {};
}

function existUpdateRecentMessage(message, room, date) {
  const existSave = localStorage.getItem(`existSave-${room}`);

  if (!existSave) {
    localStorage.setItem(`existSave-${room}`, `${message},${date}`);
    return true;
  }

  if (existSave.split(',')[0] === message && existSave.split(',')[1] === date) return false;

  localStorage.setItem(`existSave-${room}`, `${message},${date}`);
  return true;
}

function announceMessage(message, room, boardName, date, profileUrl) {
  const recentMessageList = document.getElementById(`recentMessage-${room}`);
  const recentChatList = document.getElementById('recentMessageList');
  const boardId = room.split('room')[1];
  let sendTime = new Date(new Date(date).getTime()).toLocaleString();
  if (sendTime.length === 24) sendTime = sendTime.substring(0, 21);
  else sendTime = sendTime.substring(0, 20);

  if (recentMessageList) {
    const recentMessageHtml = `<div class="user-avater">
                                <img src="${profileUrl}" alt="">
                            </div>
                            <div class="user-message">
                                <p>
                                    <a href="/chat?boardId=${boardId}" class="subject stretched-link text-truncate" style="max-width: 180px;">${boardName}</a>
                                    <span class="time-posted">${sendTime}</span>
                                </p>
                                <p>
                                    <span class="desc text-truncate" style="max-width: 215px;">${message}</span>
                                </p>
                            </div>`;
    recentMessageList.innerHTML = recentMessageHtml;
  } else {
    const recentMessageHtml = `<li class="author-online has-new-message" id="recentMessage-room${boardId}">
                                    <div class="user-avater">
                                    <img src="${profileUrl}" alt="">
                                    </div>                      
                                    <div class="user-message">
                                    <p>
                                        <a href="/chat?boardId=${boardId}" class="subject stretched-link text-truncate" style="max-width: 180px"
                                        >${boardName}</a
                                        >
                                        <span class="time-posted">${sendTime}</span>
                                    </p>
                                    <p> 
                                        <span class="desc text-truncate" style="max-width: 215px"
                                        >${message}</span
                                        >
                                    </p>
                                    </div>
                                </li>`;
    recentChatList.innerHTML += recentMessageHtml;
  }
  document.getElementById('messageAlarm').className = 'nav-item-toggle icon-active';
}

socket.on('newMessage', ({ message, room, boardName, date, profileUrl }) => {
  const myMessage = localStorage.getItem('myMessage');
  if (myMessage === 'true') return;

  const result = existUpdateRecentMessage(message, room, date);
  if (result === false) return;

  announceMessage(message, room, boardName, date, profileUrl);
});