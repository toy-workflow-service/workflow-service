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
    localStorage.setItem(`existSave-${room}`, `${message}!@#${date}`);
    return true;
  }

  if (existSave.split('!@#')[0] === message && existSave.split('!@#')[1] === date) return false;

  localStorage.setItem(`existSave-${room}`, `${message}!@#${date}`);
  return true;
}

function announceMessage(message, room, boardName, date, profileUrl) {
  const recentMessageList = document.getElementById(`recentMessage-${room}`);
  const recentChatList = document.getElementById('recentMessageList');
  const boardId = room.split('room')[1];

  let sendTime = new Date(new Date(date).getTime()).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

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

function announcePrivateMessage(room, userName, date) {
  const notificationDetail = document.getElementById('notificationDetail');

  localStorage.setItem(`notification-message`, `${room}!@#${userName}!@#${date}`);
  let roomId = room.replace('privateRoom', '');
  const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/inbox.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                  <a href="/chat?roomId=${roomId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${userName}</a>
                                  <span>님이 메시지를 보냈습니다. </span>
                                </p>
                                <p>
                                  <span class="time-posted">방금 전</span>
                                </p>
                              </div>
                            </li>`;
  notificationDetail.innerHTML += notificationHtml;
  document.getElementById('notificationAlarm').className = 'nav-item-toggle icon-active';
}

function announceInviteMessage(workspaceName, date) {
  const notificationDetail = document.getElementById('notificationDetail');

  localStorage.setItem(`notification-invite`, `${workspaceName}!@#${date}`);
  const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/user-plus.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                <span class="subject stretched-link text-truncate color-primary" style="max-width: 180px; font-weight: bold">${workspaceName}</span>
                                  <span>에 초대 되었습니다. 이메일에서 참여를 눌러 주세요. </span>
                                </p>
                                <p>
                                  <span class="time-posted">방금 전</span>
                                </p>
                              </div>
                            </li>`;
  notificationDetail.innerHTML += notificationHtml;
  document.getElementById('notificationAlarm').className = 'nav-item-toggle icon-active';
}

function announceBoardParticipationMessage(workspaceId, workspaceName, boardName, date) {
  const notificationDetail = document.getElementById('notificationDetail');

  localStorage.setItem(`notification-paticipateBoard`, `${workspaceId}!@#${workspaceName}!@#${boardName}!@#${date}`);
  const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                  <a href="/workspace?workspaceId=${workspaceId}&workspaceName=${workspaceName}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${boardName}</a>
                                  <span>보드에 참여되었습니다. </span>
                                </p>
                                <p>
                                  <span class="time-posted">방금 전</span>
                                </p>
                              </div>
                            </li>`;
  notificationDetail.innerHTML += notificationHtml;
  document.getElementById('notificationAlarm').className = 'nav-item-toggle icon-active';
}

function announceCardParticipationMessage(boardId, cardName, date) {
  const notificationDetail = document.getElementById('notificationDetail');

  localStorage.setItem(`notification-paticipateCard`, `${boardId}!@#${cardName}!@#${date}`);
  const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                  <a href="/board?boardId=${boardId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${cardName}</a>
                                  <span>카드에 참여되었습니다. </span>
                                </p>
                                <p>
                                  <span class="time-posted">방금 전</span>
                                </p>
                              </div>
                            </li>`;
  notificationDetail.innerHTML += notificationHtml;
  document.getElementById('notificationAlarm').className = 'nav-item-toggle icon-active';
}

socket.on('newMessage', ({ message, room, boardName, date, profileUrl }) => {
  const myMessage = localStorage.getItem('myMessage');
  if (myMessage === 'true') return;

  const result = existUpdateRecentMessage(message, room, date);
  if (result === false) return;

  announceMessage(message, room, boardName, date, profileUrl);
});

socket.on('newPrivateMessage', ({ room, userName, date }) => {
  announcePrivateMessage(room, userName, date);
});

socket.on('inviteWorkspaceMessage', ({ workspaceName, date }) => {
  announceInviteMessage(workspaceName, date);
});

socket.on('inviteBoardMessage', ({ workspaceId, workspaceName, boardName, date }) => {
  announceBoardParticipationMessage(workspaceId, workspaceName, boardName, date);
});

socket.on('inviteCardMessage', ({ boardId, cardName, date }) => {
  announceCardParticipationMessage(boardId, cardName, date);
});
