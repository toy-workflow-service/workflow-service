const socket = io.connect('/');

function existUpdateRecentMessage(message, room, date, profileUrl) {
  const existSave = localStorage.getItem(`existSave-${room}`);

  if (!existSave) {
    if (!localStorage.getItem(`recentMessage-${room}`) || !localStorage.getItem(`recentProfileUrl-${room}`)) {
      localStorage.setItem(`recentMessage-${room}`, `${message}!@#${date}`);
      localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);
    } else {
      const recentMessage = localStorage.getItem(`recentMessage-${room}`).split('!@#');
      if (recentMessage[0] !== message || recentMessage[1] !== date) {
        localStorage.setItem(`recentMessage-${room}`, `${message}!@#${date}`);
        localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);
      }
    }
    localStorage.setItem(`existSave-${room}`, `${message}!@#${date}`);
    return true;
  }

  if (existSave.split('!@#')[0] === message && existSave.split('!@#')[1] === date) return false;

  if (!localStorage.getItem(`recentMessage-${room}`) || !localStorage.getItem(`recentProfileUrl-${room}`)) {
    localStorage.setItem(`recentMessage-${room}`, `${message}!@#${date}`);
    localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);
  } else {
    const recentMessage = localStorage.getItem(`recentMessage-${room}`).split('!@#');
    if (recentMessage[0] !== message || recentMessage[1] !== date) {
      localStorage.setItem(`recentMessage-${room}`, `${message}!@#${date}`);
      localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);
    }
  }

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

function announceBoardParticipationMessage(workspaceId, boardName, date) {
  const notificationDetail = document.getElementById('notificationDetail');

  localStorage.setItem(`notification-paticipateBoard`, `${workspaceId}!@#${boardName}!@#${date}`);
  const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                  <a href="/workspace?workspaceId=${workspaceId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${boardName}</a>
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

function acceptVideoCallByModal(callRoomId, senderId, senderName, receiverId, receiverName) {
  window.open(
    `/videoCall?senderId=${senderId}&senderName=${senderName}&receiverId=${receiverId}&receiverName=${receiverName}&callRoomId=${callRoomId}`,
    '_blank',
    'width=860, height=730'
  );
  window.location.reload();
}

function acceptVideoCall(data) {
  const callRoomId = data.getAttribute('callRoomId');
  const senderId = data.getAttribute('senderId');
  const senderName = data.getAttribute('senderName');
  const receiverId = data.getAttribute('receiverId');
  const receiverName = data.getAttribute('receiverName');

  window.open(
    `/videoCall?senderId=${senderId}&senderName=${senderName}&receiverId=${receiverId}&receiverName=${receiverName}&callRoomId=${callRoomId}`,
    '_blank',
    'width=860, height=730'
  );
  window.location.reload();
}

function refuseVideoCall(data) {
  const callRoomId = data.getAttribute('callRoomId');
  const senderId = data.getAttribute('senderId');

  socket.emit('refuseVideoCall', { callRoomId, senderId });
  window.location.reload();
}

function announceInviteVideoCall(callRoomId, senderId, senderName, receiverId, receiverName) {
  Swal.fire({
    customClass: {
      container: 'my-swal',
    },
    icon: 'question',
    title: `${senderName}님의 영상통화 요청`,
    text: `수락하시겠습니까?`,

    showCancelButton: true,
    confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
    cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
    confirmButtonText: '수락', // confirm 버튼 텍스트 지정
    cancelButtonText: '닫기', // cancel 버튼 텍스트 지정
  }).then((result) => {
    if (result.isConfirmed) {
      acceptVideoCallByModal(callRoomId, senderId, senderName, receiverId, receiverName);
    }
  });
  const inviteCallAlarmList = document.getElementById('inviteCallAlarmList');
  if (inviteCallAlarmList) {
    const inviteCallHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                              <div class="nav-notification__type nav-notification__type--primary">
                                <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                              </div>
                              <div class="nav-notification__details">
                                <p>
                                  <span style="max-width: 180px; font-weight: bold">${senderName}</span>
                                  <span>님이 영상통화를 걸었습니다. </span>
                                </p>
                                <div>
                                  <button class="customCallBtn" callRoomId="${callRoomId}" senderId="${senderId}" senderName="${senderName}" receiverId="${receiverId}" receiverName="${receiverName}" onclick="acceptVideoCall(this)">수락</button>
                                  <button class="customCallBtn" callRoomId="${callRoomId}" senderId="${senderId}" onclick="refuseVideoCall(this)">거절</button>
                                </div>
                              </div>
                            </li>`;

    inviteCallAlarmList.innerHTML += inviteCallHtml;
    document.getElementById('inviteCallRoom').className = 'nav-item-toggle icon-active';
  }
}

function announceRefuseVideoCall(receiverName) {
  if (document.getElementById('notificationDetail')) {
    const notificationDetail = document.getElementById('notificationDetail');

    const notificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                                <div class="nav-notification__type nav-notification__type--primary">
                                  <img class="svg" src="../assets/img/svg/x-circle.svg" alt="inbox" />
                                </div>
                                <div class="nav-notification__details">
                                  <p>
                                  <span class="subject stretched-link text-truncate color-primary" style="max-width: 180px; font-weight: bold">${receiverName}</span>
                                    <span>님이 영상통화를 거절하셨습니다. </span>
                                  </p>
                                  <p>
                                  <span class="time-posted">방금 전</span>
                                  </p>
                                </div>
                              </li>`;
    notificationDetail.innerHTML += notificationHtml;
    document.getElementById('notificationAlarm').className = 'nav-item-toggle icon-active';
  }
}

socket.on('newMessage', ({ message, room, boardName, date, profileUrl }) => {
  const myMessage = localStorage.getItem('myMessage');
  if (myMessage === 'true') return;

  const result = existUpdateRecentMessage(message, room, date, profileUrl);
  if (result === false) return;

  announceMessage(message, room, boardName, date, profileUrl);
});

socket.on('newPrivateMessage', ({ room, userName, date }) => {
  announcePrivateMessage(room, userName, date);
});

socket.on('inviteWorkspaceMessage', ({ workspaceName, date }) => {
  announceInviteMessage(workspaceName, date);
});

socket.on('inviteBoardMessage', ({ workspaceId, boardName, date }) => {
  announceBoardParticipationMessage(workspaceId, boardName, date);
});

socket.on('inviteCardMessage', ({ boardId, cardName, date }) => {
  announceCardParticipationMessage(boardId, cardName, date);
});

socket.on('inviteVideoCall', ({ callRoomId, senderId, senderName, receiverId, receiverName }) => {
  announceInviteVideoCall(callRoomId, senderId, senderName, receiverId, receiverName);
});

socket.on('refuseVideoCall', ({ receiverName }) => {
  announceRefuseVideoCall(receiverName);
});
