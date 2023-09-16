const logoutBtn = document.querySelector('#logoutBtn');
const workspaceList = document.querySelector('.workspace-list');
const workspaceListTop = document.querySelector('#workspace-list-top');
let accessToken;
let boardIds = [];
let boardNames = [];

$(document).ready(async () => {
  getAccessToken();
  await getWorkspaces();
  await getRecentMessage();
  getMyBoardMessage();
  getNotification();
});

function getAccessToken() {
  const regExp = new RegExp(/^[accessToken=]/);
  document.cookie.split(' ').forEach((value) => {
    if (regExp.exec(value)) {
      accessToken = value;
      accessToken = accessToken.replace('accessToken=', '');
      accessToken = accessToken.replace(';', '');
    }
  });
}

function logout() {
  $.ajax({
    method: 'POST',
    url: '/users/logout',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success!',
        text: data.message,
      }).then(() => {
        window.localStorage.clear();
        window.location.href = '/';
      });
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
    },
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

// 워크스페이스 조회
async function getWorkspaces() {
  try {
    await $.ajax({
      method: 'GET',
      url: `/workspaces`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        data.forEach((workspace) => {
          if (workspace.memberships_id !== null) {
            result = `<li class="">
                          <a href="/workspace?workspaceId=${workspace.id}">
                          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" style="margin-right: 5px"/>
                          ${workspace.name}</a>
                     </li>`;
          } else {
            result = `<li class="">
                        <a href="/workspace?workspaceId=${workspace.id}">${workspace.name}</a>
                     </li>`;
          }

          if (workspace.memberships_id !== null) {
            topResult = `<li class="">
                          <a href="/workspace?workspaceId=${workspace.id}">
                          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" style="margin-right: 5px"/>
                          ${workspace.name}</a>
                        </li>`;
          } else {
            topResult = `<li class="">
                          <a href="/workspace?workspaceId=${workspace.id}">
                          ${workspace.name}</a>
                        </li>`;
          }
          workspaceList.innerHTML += result;
          workspaceListTop.innerHTML += topResult;
        });
      },
      error: (err) => {
        if (err.status === 308) {
          Swal.fire({
            customClass: {
              container: 'my-swal',
            },
            icon: 'error',
            title: 'error',
            text: err.responseJSON.message,
          }).then(() => {
            window.location.href = '/block';
          });
        } else {
          Swal.fire({
            customClass: {
              container: 'my-swal',
            },
            icon: 'error',
            title: 'error',
            text: err.responseJSON.message,
          }).then(() => {
            window.location.href = '/';
          });
        }
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 워크스페이스 생성 모달열기
async function openCreateWorkspaceModal() {
  $('#modal-basic4').modal('show');
}

// 워크스페이스 생성
async function createWorkspace() {
  const editModal = document.querySelector('#modal-basic4');
  const titleInput = editModal.querySelector('#create-title').value;
  const descriptionInput = editModal.querySelector('#create-description').value;
  const typeInput = editModal.querySelector('#select-search').value;

  try {
    await $.ajax({
      method: 'POST',
      url: `/workspaces`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name: titleInput, type: typeInput, description: descriptionInput }),
      success: () => {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'success',
          title: 'success!',
          text: '워크스페이스 생성 완료',
        }).then(() => {
          $('#modal-basic4').modal('hide');
          window.location.reload();
        });
      },
    });
  } catch (err) {
    if (err.responseJSON.message === '핸드폰 인증이 필요한 서비스입니다. ') {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'error',
        text: err.responseJSON.message,
      }).then(() => {
        window.location.href = '/userInfo';
      });
    } else {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'error',
        text: err.responseJSON.message,
      });
    }
  }
}

async function getRecentMessage() {
  const messageList = document.getElementById('recentMessageList');
  const recentMessageContainer = document.getElementById('recentMessageContainer');

  let room = [];
  let name;

  await $.ajax({
    method: 'GET',
    url: '/boards/getBoards/joinBoards',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      const results = data.joinBoards;
      name = data.userName;
      localStorage.removeItem('myMessage');
      results.forEach((array) => {
        if (localStorage.getItem(`recentMessage-room${array.board_id}`)) {
          const recentMessage = localStorage.getItem(`recentMessage-room${array.board_id}`).split('!@#')[0];
          const profileUrl = localStorage.getItem(`recentProfileUrl-room${array.board_id}`);
          let time;
          if (localStorage.getItem(`existSave-room${array.board_id}`))
            time = localStorage.getItem(`existSave-room${array.board_id}`).split('!@#')[1];
          else time = localStorage.getItem(`recentTime-room${array.board_id}`);

          let sendTime = new Date(new Date(time).getTime()).toLocaleString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          const messageHtml = `<li class="author-online has-new-message" id="recentMessage-room${array.board_id}">
                                  <div class="user-avater">
                                    <img src="${profileUrl}" alt="">
                                  </div>                      
                                  <div class="user-message">
                                    <p>
                                      <a href="/chat?boardId=${array.board_id}" class="subject stretched-link text-truncate" style="max-width: 180px"
                                        >${array.board_name}</a
                                      >
                                      <span class="time-posted">${sendTime}</span>
                                    </p>
                                    <p> 
                                      <span class="desc text-truncate" style="max-width: 215px"
                                        >${recentMessage}</span
                                      >
                                    </p>
                                  </div>
                              </li>`;
          messageList.innerHTML += messageHtml;

          document.getElementById('messageAlarm').className = 'nav-item-toggle ';
        }
        boardIds.push(array.board_id);
        boardNames.push(array.board_name);
        room.push(array.board_id);
      });
    },
    error: (error) => {
      console.log(error);
    },
  });
  recentMessageContainer.scrollTop = recentMessageContainer.scrollHeight;
  joinRoom(room, name);
}

function joinRoom(rooms, name) {
  rooms.forEach((roomId) => {
    socket.emit('join', { room: 'room' + roomId, name });
  });
}

function getMyBoardMessage() {
  const groupChat = document.querySelector('.groupChat');
  const groupChat2 = document.querySelector('.groupChattingRoom');

  boardNames.forEach((array, idx) => {
    const groupChatRoom = `<li>
                             <a href="/chat?boardId=${boardIds[idx]}" ><i nav-icon uil uil-comment-dots></i>${array}</a>
                           </li>`;
    groupChat.innerHTML += groupChatRoom;
    groupChat2.innerHTML += groupChatRoom;
  });
}

function getNotification() {
  const notificationDetail = document.getElementById('notificationDetail');

  if (localStorage.getItem('notification-message')) {
    let notificationMessage = localStorage.getItem('notification-message').split('!@#');
    let [messageRoomId, messageUserName, messageDate] = [...notificationMessage];
    const now = new Date().getTime();
    messageDate = now - new Date(messageDate).getTime();
    messageRoomId = messageRoomId.replace('privateRoom', '');

    let sendTime = Math.floor(messageDate / (60 * 1000));
    if (sendTime === 0) sendTime = '방금 전';
    else if (sendTime < 60) sendTime = `${sendTime}분 전`;
    else {
      sendTime = `${Math.floor(sendTime / 60)}시간 전`;
    }

    const messageNotificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                                      <div class="nav-notification__type nav-notification__type--primary">
                                        <img class="svg" src="../assets/img/svg/inbox.svg" alt="inbox" />
                                      </div>
                                      <div class="nav-notification__details">
                                        <p>
                                          <a href="/chat?roomId=${messageRoomId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${messageUserName}</a>
                                          <span>님이 메시지를 보냈습니다. </span>
                                        </p>
                                        <p>
                                          <span class="time-posted">${sendTime}</span>
                                        </p>
                                      </div>
                                    </li>`;
    notificationDetail.innerHTML += messageNotificationHtml;
  }

  if (localStorage.getItem('notification-invite')) {
    let notificationInvite = localStorage.getItem('notification-invite').split('!@#');
    let [workspaceName, inviteDate] = [...notificationInvite];
    const now = new Date().getTime();
    inviteDate = now - new Date(inviteDate).getTime();

    let sendTime = Math.floor(inviteDate / (60 * 1000));
    if (sendTime === 0) sendTime = '방금 전';
    else if (sendTime < 60) sendTime = `${sendTime}분 전`;
    else {
      sendTime = `${Math.floor(sendTime / 60)}시간 전`;
    }

    const messageNotificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                                      <div class="nav-notification__type nav-notification__type--primary">
                                        <img class="svg" src="../assets/img/svg/user-plus.svg" alt="inbox" />
                                      </div>
                                      <div class="nav-notification__details">
                                        <p>
                                          <span class="subject stretched-link text-truncate color-primary" style="max-width: 180px; font-weight: bold">${workspaceName}</span>
                                          <span>에 초대 되었습니다. 이메일에서 참여를 눌러 주세요. </span>
                                        </p>
                                        <p>
                                          <span class="time-posted">${sendTime}</span>
                                        </p>
                                      </div>
                                    </li>`;
    notificationDetail.innerHTML += messageNotificationHtml;
  }

  if (localStorage.getItem('notification-paticipateBoard')) {
    let notificationParticipation = localStorage.getItem('notification-paticipateBoard').split('!@#');
    let [workspaceId, boardName, date] = [...notificationParticipation];

    const now = new Date().getTime();
    date = now - new Date(date).getTime();
    let sendTime = Math.floor(date / (60 * 1000));
    if (sendTime === 0) sendTime = '방금 전';
    else if (sendTime < 60) sendTime = `${sendTime}분 전`;
    else {
      sendTime = `${Math.floor(sendTime / 60)}시간 전`;
    }

    const messageNotificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                                      <div class="nav-notification__type nav-notification__type--primary">
                                        <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                                      </div>
                                      <div class="nav-notification__details">
                                        <p>
                                          <a href="/workspace?workspaceId=${workspaceId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${boardName}</a>
                                          <span>보드에 참여되었습니다. </span>
                                        </p>
                                        <p>
                                          <span class="time-posted">${sendTime}</span>
                                        </p>
                                      </div>
                                    </li>`;
    notificationDetail.innerHTML += messageNotificationHtml;
  }

  if (localStorage.getItem('notification-paticipateCard')) {
    let notificationParticipation = localStorage.getItem('notification-paticipateCard').split('!@#');
    let [boardId, cardName, date] = [...notificationParticipation];

    const now = new Date().getTime();
    date = now - new Date(date).getTime();
    let sendTime = Math.floor(date / (60 * 1000));
    if (sendTime === 0) sendTime = '방금 전';
    else if (sendTime < 60) sendTime = `${sendTime}분 전`;
    else {
      sendTime = `${Math.floor(sendTime / 60)}시간 전`;
    }

    const messageNotificationHtml = `<li class="nav-notification__single nav-notification__single--unread d-flex flex-wrap">
                                      <div class="nav-notification__type nav-notification__type--primary">
                                        <img class="svg" src="../assets/img/svg/user-check.svg" alt="inbox" />
                                      </div>
                                      <div class="nav-notification__details">
                                        <p>
                                          <a href="/board?boardId=${boardId}" class="subject stretched-link text-truncate" style="max-width: 180px; font-weight: bold">${cardName}</a>
                                          <span>카드에 참여되었습니다. </span>
                                        </p>
                                        <p>
                                          <span class="time-posted">${sendTime}</span>
                                        </p>
                                      </div>
                                    </li>`;
    notificationDetail.innerHTML += messageNotificationHtml;
  }
}

function searchVideoCall() {
  const searchResult = document.querySelector('#searchVideoCallResult');
  const email = document.querySelector('#searchVideoCall').value;
  if (!email) {
    searchResult.innerHTML = `<p style="margin: 7% auto 0 32%"> 검색할 이메일을 입력해 주세요. </p>`;
    return;
  }
  searchResult.innerHTML = '';
  $.ajax({
    method: 'GET',
    url: `/users/searchEmail/${email}`,
    success: (data) => {
      const { user } = data;
      if (!user) {
        searchResult.innerHTML = `<p style="margin: 7% auto 0 25%"> 검색한 유저가 없습니다. 다시 검색해 주세요. </p>`;
        return;
      }

      searchResult.innerHTML = `<div style="margin: 7% auto 0 5%" >
                                  <input type="radio"
                                  name="chatUser"
                                  value="${user.id}" /> ${user.name}
                                </div>`;
    },
    error: (error) => {
      console.log(error);
    },
  });
}

function inviteVideoCallModal() {
  const userId = $('input[type=radio][name=chatUser]:checked').val();

  if (!userId) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '채팅에 초대할 유저를 선택해 주세요. ',
    });
    return;
  }

  $.ajax({
    method: 'GET',
    url: `/users/userInfos/${userId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      const { senderId, senderName, receiverId, receiverName } = data;
      if (senderId === receiverId) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'Error',
          text: '자기 자신에게는 이용할 수 없는 기능입니다. ',
        });
      } else {
        document.querySelector('#searchVideoCall').value = '';
        document.querySelector('#searchVideoCallResult').innerHTML = '';
        $('#newVideoCallModal').modal('hide');
        window.open(
          `/videoCall?senderId=${senderId}&senderName=${senderName}&receiverId=${receiverId}&receiverName=${receiverName}`,
          '_blank',
          'width=860, height=730'
        );
      }
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
      return;
    },
  });
}
