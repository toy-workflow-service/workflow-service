const logoutBtn = document.querySelector('#logoutBtn');
const workspaceList = document.querySelector('.workspace-list');
const workspaceListTop = document.querySelector('#workspace-list-top');
const accessToken = document.cookie.split(';')[0].split('=')[1];
let boardIds = [];
let boardNames = [];

$(document).ready(async () => {
  await getWorkspaces();
  await getRecentMessage();
  getMyBoardMessage();
});

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
                          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" />
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
                          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" />
                          ${workspace.name}</a>
                        </li>`;
          } else {
            topResult = `<li class="">
                          <a href="/workspace?workspaceId=${workspace.id}">
                          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" />
                          ${workspace.name}</a>
                        </li>`;
          }
          workspaceList.innerHTML += result;
          workspaceListTop.innerHTML += topResult;
        });
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
      results.forEach((array) => {
        if (localStorage.getItem(`recentMessage-room${array.board_id}`)) {
          const recentMessage = localStorage.getItem(`recentMessage-room${array.board_id}`);
          const profileUrl = localStorage.getItem(`recentProfileUrl-room${array.board_id}`);
          let time;
          if (localStorage.getItem(`existSave-room${array.board_id}`))
            time = localStorage.getItem(`existSave-room${array.board_id}`).split(',')[1];
          else time = localStorage.getItem(`recentTime-room${array.board_id}`);

          let sendTime = new Date(new Date(time).getTime()).toLocaleString();
          if (sendTime.length === 24) sendTime = sendTime.substring(0, 21);
          else sendTime = sendTime.substring(0, 20);

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
