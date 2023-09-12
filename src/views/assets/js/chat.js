const boardChatList = document.querySelector('#chat-list-tab');
const privateChatList = document.querySelector('#private-chat-list-tab');
const boardChatMessageList = document.querySelector('#v-pills-tabContent');
const params = new URLSearchParams(window.location.search);
const offset = new Date().getTimezoneOffset() * 60 * 1000;
let boardId = params.get('boardId');
let privateRoomId = params.get('roomId');
let myBoardIds = [];
let myBoardNames = [];
let loginUserId, loginUserName, loginProfileUrl;
let memberNameList = [];
let memberIdList = [];
let memberPhoneList = [];
let memberEmailList = [];
let memberProfileUrlList = [];
let privateMemberIdList = [];
let privateRoomIdList = [];
let privateRoomNameList = [];
let privateRoomProfileUrlList = [];
let privateRoomEmailList = [];
let privateRoomPhoneList = [];
if (!boardId) boardId = 0;
if (!privateRoomId) privateRoomId = 0;

$(document).ready(async () => {
  await getChatRooms();
  await getPrivateChatRooms();
  createUserInfoModal();
  getMemberList();

  if (myBoardIds.length) {
    $(`#room${myBoardIds[0]}-chat-list`).scrollTop($(`#room${myBoardIds[0]}-chat-list`)[0].scrollHeight);
    myBoardIds.forEach((boardId) => {
      const inputMessage = document.getElementById(`room${boardId}-messageInput`);
      const boardName = inputMessage.getAttribute('boardName');
      const groupChatList = document.querySelector(`#chat-list-room${boardId}-tab`);
      const groupRoomChatList = document.querySelector(`#chat-list-room${boardId}`);

      inputMessage.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
          sendRoomMessage(`room${boardId}`, boardName);
        }
      });

      groupChatList.addEventListener('click', () => {
        //toggle을 활성화 시켜야 됨.
        groupRoomChatList.classList.toggle('active');
        $(`#room${boardId}-chat-list`).scrollTop($(`#room${boardId}-chat-list`)[0].scrollHeight);
      });
    });
  }
  if (privateRoomIdList.length) {
    privateRoomIdList.forEach((roomId) => {
      const privateInputMessage = document.getElementById(`privateRoom${roomId}-messageInput`);
      const roomName = privateInputMessage.getAttribute('roomName');
      const messageBtn = document.getElementById(`privateRoom${roomId}`);
      const privateChatList = document.querySelector(`#chat-list-privateRoom${roomId}-tab`);
      const privateRoomChatList = document.querySelector(`#chat-list-privateRoom${roomId}`);

      privateInputMessage.addEventListener('keyup', function (event) {
        const receiverId = messageBtn
          .getAttribute('userList')
          .split(' ')
          .filter((id) => id !== loginUserId);
        if (event.key === 'Enter') {
          sendPrivateRoomMessage(`privateRoom${roomId}`, roomName, receiverId[0]);
        }
      });

      privateChatList.addEventListener('click', () => {
        //toggle을 활성화 시켜야 됨.
        privateRoomChatList.classList.toggle('active');
        $(`#privateRoom${roomId}-chat-list`).scrollTop($(`#privateRoom${roomId}-chat-list`)[0].scrollHeight);
      });
    });
  }

  deleteToggleActive();

  boardChatList.style.overflow = 'auto';
  privateChatList.style.overflow = 'auto';

  searchChatRoomEvent();
});

async function getChatRooms() {
  if (privateRoomId) {
    document.querySelector('#first-tab').classList.remove('active');
    document.querySelector('#second-tab').classList.add('active');
    document.querySelector('#panel_b_first').classList.remove('active');
    document.querySelector('#panel_b_first').classList.remove('show');
    document.querySelector('#panel_b_second').classList.add('active');
    document.querySelector('#panel_b_second').classList.add('show');
  }

  await $.ajax({
    method: 'GET',
    url: `/boardMessages/${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      const boardMembers = data.boardMembers;
      const messageList = data.boardMessageResults;
      loginUserId = data.userId;
      loginUserName = data.userName;
      loginProfileUrl = data.userProfileUrl ? data.userProfileUrl : '../assets/img/favicon.png';
      boardMembers.forEach((result, idx) => {
        result.forEach((member) => {
          if (memberIdList.includes(member.user_id)) return;
          let phoneNumber = member.user_phone_number ? member.user_phone_number : '번호 등록 안됨';
          memberIdList.push(member.user_id);
          memberNameList.push(member.user_name);
          memberPhoneList.push(phoneNumber);
          memberEmailList.push(member.user_email);
          memberProfileUrlList.push(member.user_profile_url);
        });
        myBoardIds.push(result[0].board_id);
        myBoardNames.push(result[0].board_name);
        let active, ariaSelected;
        if (idx === 0 && !privateRoomId) {
          active = `nav-link active`;
          ariaSelected = 'true';
        } else {
          active = `nav-link`;
          ariaSelected = 'false';
        }
        if (messageList[idx].length > 0) {
          const lastMessageInfo = messageList[idx][messageList[idx].length - 1];
          const img = lastMessageInfo.user_profile_url ? lastMessageInfo.user_profile_url : '../assets/img/favicon.png';
          const sendTime = new Date(new Date(lastMessageInfo.message_created_at).getTime() - offset).toLocaleString(
            'ko-KR',
            {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }
          );

          let message = lastMessageInfo.message_message ? lastMessageInfo.message_message : '파일을 보냈습니다. ';
          if (message.length > 15) {
            message = message.substring(0, 15) + '...';
          }
          const chatListHtml = `<a class="${active}" id="chat-list-room${lastMessageInfo.board_id}-tab" href="#chat-list-room${lastMessageInfo.board_id}" role="tab" data-bs-toggle="pill" aria-selected="${ariaSelected}" style="width:409px">
                                  <li class="user-list-item">
                                    <div class="user-list-item__wrapper" id="recentChatList-room${lastMessageInfo.board_id}">
                                      <div class="avatar avatar-circle ms-0">
                                        <img
                                          src="${img}"
                                          class="rounded-circle wh-46 d-flex bg-opacity-primary"
                                          alt="image"
                                        />
                                      </div>
                                      <div class="users-list-body">
                                        <div class="users-list-body-title">
                                          <h6>${lastMessageInfo.board_name}</h6>
                                          <div class="text-limit" data-maxlength="10">
                                            <p class="mb-0">
                                              <span>${lastMessageInfo.user_name} : ${message} </span> 
                                            </p>
                                          </div>
                                        </div>
                                        <div class="last-chat-time unread">
                                          <small>${sendTime}</small>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                </a>`;
          boardChatList.innerHTML += chatListHtml;
        } else {
          const chatListHtml = `<a class="${active}" id="chat-list-room${result[0].board_id}-tab" href="#chat-list-room${result[0].board_id}" role="tab" data-bs-toggle="pill" aria-selected="${ariaSelected}" style="width:409px">
                                <li class="user-list-item">
                                  <div class="user-list-item__wrapper" id="recentChatList-room${result[0].board_id}">
                                    <div class="avatar avatar-circle ms-0">
                                      <img
                                        src="../assets/img/favicon.png"
                                        class="rounded-circle wh-46 d-flex bg-opacity-primary"
                                        alt="image"
                                      />
                                    </div>
                                    <div class="users-list-body">
                                      <div class="users-list-body-title">
                                        <h6>${result[0].board_name}</h6>
                                        <div class="text-limit" data-maxlength="10">
                                          <p class="mb-0">
                                            <span>메시지가 없습니다. </span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                                </a>`;
          boardChatList.innerHTML += chatListHtml;
        }
      });

      //대화방 메시지
      messageList.forEach((list, idx) => {
        let activeMessage;
        if (idx === 0 && !privateRoomId) {
          activeMessage = `fade show active`;
        } else {
          activeMessage = `fade `;
        }
        let boardMemberPhoto = boardMembers[idx].map((member) => {
          const img = member.user_profile_url ? member.user_profile_url : '../assets/img/favicon.png';
          return `<li style="margin-left: 5px">
                    <img id="photo${member.user_id}" src="${img}" alt="img" class="wh-30 rounded-circle" />
                  </li>`;
        });
        boardMemberPhoto = boardMemberPhoto.join('\n');

        if (list.length === 0) {
          const chatRoomMessageList = `<div class="tab-pane ${activeMessage}" id="chat-list-room${boardMembers[idx][0].board_id}" role="tabpanel" aria-labelledby="chat-list-room${boardMembers[idx][0].board_id}-tab" >
                                          <div class="chat" >
                                            <div class="chat-body bg-white radius-xl">
                                              <div class="chat-header">
                                                <div class="media chat-name align-items-center">
                                                  <div class="media-body align-self-center">
                                                    <h5 class="mb-0 fw-500 text-uppercase">${boardMembers[idx][0].board_name}</h5>
                                                  </div>
                                                </div>
                                                <div class="image-group">
                                                  <ul class="d-flex">
                                                    ${boardMemberPhoto}
                                                  </ul>
                                                </div>
                                                <ul class="nav flex-nowrap">                                                 
                                                </ul>
                                              </div>
                                              <div class="chat-box chat-box--big p-xl-30 ps-lg-20 pe-lg-0" id="room${boardMembers[idx][0].board_id}-chat-list">                                          
                                              </div>
                                              <div class="chat-footer px-xl-30 px-lg-20 pb-lg-30 pt-1">
                                                <div class="chat-type-text">
                                                  <div
                                                    class="pt-0 outline-0 pb-0 pe-0 ps-0 rounded-0 position-relative d-flex align-items-center"
                                                    tabindex="-1"
                                                  >
                                                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap">
                                                      <div class="flex-1 d-flex align-items-center chat-type-text__write ms-0">
                                                        <input class="form-control border-0 bg-transparent" id="room${boardMembers[idx][0].board_id}-messageInput" boardName="${boardMembers[idx][0].board_name}" placeholder="메시지를 입력해 주세요. " />
                                                      </div>
                                                      <div class="chat-type-text__btn">                                                      
                                                        <button  class="border-0 btn-deep color-light wh-50 p-10 rounded-circle">
                                                          <input id="message-file-upload${boardMembers[idx][0].board_id}" type="file" name="newFile" class="d-none" boardId="${boardMembers[idx][0].board_id}" boardName="${boardMembers[idx][0].board_name}" onchange="uploadFile(this)" />
                                                          <label for="message-file-upload${boardMembers[idx][0].board_id}" >
                                                            <img class="svg" src="../assets/img/svg/paperclip.svg" alt="paperclip" style="cursor: pointer">
                                                          </label>
                                                        </button>
                                                        <button type="button" class="border-0 btn-primary wh-50 p-10 rounded-circle" id="${boardMembers[idx][0].board_id}" boardName="${boardMembers[idx][0].board_name}" onclick="sendMessage(this)">
                                                          <img class="svg" src="../assets/img/svg/send.svg" alt="send" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>`;
          boardChatMessageList.innerHTML += chatRoomMessageList;
        } else {
          let messages = [];
          list.map((data) => {
            let time = new Date(new Date(data.message_created_at).getTime() - offset).toLocaleString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            if (data.user_id === loginUserId) {
              const message = data.message_message
                ? data.message_message
                : `<a class="color-gray" href="${data.message_file_url}" target="_blank">${data.message_file_original_name}</a>`;
              //내가 보낸 메시지
              const messageHtml = `<!-- Start: Outgoing -->
                                    <div class="flex-1 justify-content-end d-flex outgoing-chat mt-20">
                                        <div class="chat-text-box">
                                          <div class="media ">
                                              <div class="media-body">
                                                <div class="chat-text-box__content">
                                                    <div class="chat-text-box__title d-flex align-items-center justify-content-end mb-2">
                                                      <span class="chat-text-box__time fs-12 color-light fw-400">${time}</span>
                                                    </div>
                                                    <div class="d-flex align-items-center justify-content-end">
                                                      <div class="chat-text-box__other d-flex">
                                                          <div class="px-15">

                                                            <div class="dropdown dropdown-click">
                                                                <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                  <img src="../assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                                                </button>
                                                                <div class="dropdown-default dropdown-bottomRight dropdown-menu-right dropdown-menu" style="">
                                                                  <button class="dropdown-item" id="${data.message_id}" onclick="deleteMessage(this)">삭제하기</button>
                                                                </div>
                                                            </div>

                                                          </div>
                                                      </div>
                                                      <div class="chat-text-box__subtitle p-20 bg-deep">
                                                          <p class="color-gray">${message}</p>
                                                      </div>

                                                    </div>
                                                </div>
                                              </div>
                                          </div>
                                        </div>
                                    </div>
                                  <!-- End: Outgoing  -->`;
              messages.push(messageHtml);
            } else {
              const message = data.message_message
                ? data.message_message
                : `<a class="color-white" href="${data.message_file_url}" target="_blank">${data.message_file_original_name}</a>`;
              const img = data.user_profile_url ? data.user_profile_url : '../assets/img/favicon.png';
              //상대방이 보낸 메시지
              const messageHtml = `<!-- Start: Incomming -->
                                    <div class="flex-1 incoming-chat">
                                      <div class="chat-text-box ">
                                          <div class="media d-flex">
                                            <div class="chat-text-box__photo ">
                                                <img src="${img}" class="align-self-start me-15 wh-46" data-bs-toggle="modal" data-bs-target="#new-member${data.user_id}" alt="img" />
                                            </div>
                                            <div class="media-body">
                                                <div class="chat-text-box__content">
                                                  <div class="chat-text-box__title d-flex align-items-center">
                                                      <h6 class="fs-14">${data.user_name}</h6>
                                                      <span class="chat-text-box__time fs-12 color-light fw-400 ms-15">${time}</span>
                                                  </div>
                                                  <div class="d-flex align-items-center mb-20 mt-10">
                                                      <div class="chat-text-box__subtitle p-20 bg-primary">
                                                        <p class="color-white">${message}</p>
                                                      </div>
                                                      <div class="chat-text-box__other d-flex">
                                                        <div class="chat-text-box__reaction px-sm-15 px-2">
                                                        </div>
                                                      </div>
                                                  </div>
                                                </div>
                                            </div>
                                          </div>
                                      </div>
                                    </div>
                                  <!-- End: Incomming -->`;
              messages.push(messageHtml);
            }
          });
          messages = messages.join('\n');
          const chatRoomMessageList = `<div class="tab-pane ${activeMessage}" id="chat-list-room${boardMembers[idx][0].board_id}" role="tabpanel" aria-labelledby="chat-list-room${boardMembers[idx][0].board_id}-tab" >                                         
                                          <div class="chat">
                                            <div class="chat-body bg-white radius-xl">
                                              <div class="chat-header">
                                                <div class="media chat-name align-items-center">
                                                  <div class="media-body align-self-center">
                                                    <h5 class="mb-0 fw-500 text-uppercase">${boardMembers[idx][0].board_name}</h5>
                                                  </div>
                                                </div>
                                                <div class="image-group">
                                                  <ul class="d-flex">
                                                    ${boardMemberPhoto}
                                                  </ul>
                                                </div>
                                                <ul class="nav flex-nowrap">                                                 
                                                </ul>
                                              </div>
                                              <div class="chat-box chat-box--big p-xl-30 ps-lg-20 pe-lg-0" id="room${boardMembers[idx][0].board_id}-chat-list">
                                              ${messages}                                            
                                              </div>
                                              <div class="chat-footer px-xl-30 px-lg-20 pb-lg-30 pt-1">
                                                <div class="chat-type-text">
                                                  <div
                                                    class="pt-0 outline-0 pb-0 pe-0 ps-0 rounded-0 position-relative d-flex align-items-center"
                                                    tabindex="-1"
                                                  >
                                                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap">
                                                      <div class="flex-1 d-flex align-items-center chat-type-text__write ms-0">
                                                        <input class="form-control border-0 bg-transparent w-100" id="room${boardMembers[idx][0].board_id}-messageInput" boardName="${boardMembers[idx][0].board_name}" placeholder="메시지를 입력해 주세요. " />
                                                      </div>
                                                      <div class="chat-type-text__btn">
                                                        <button  class="border-0 btn-deep color-light wh-50 p-10 rounded-circle">
                                                          <input id="message-file-upload${boardMembers[idx][0].board_id}" type="file" name="newFile" class="d-none" boardId="${boardMembers[idx][0].board_id}" boardName="${boardMembers[idx][0].board_name}" onchange="uploadFile(this)" />
                                                          <label for="message-file-upload${boardMembers[idx][0].board_id}" >
                                                            <img class="svg" src="../assets/img/svg/paperclip.svg" alt="paperclip" style="cursor: pointer">
                                                          </label>
                                                        </button>
                                                        <button type="button" class="border-0 btn-primary wh-50 p-10 rounded-circle" id="${boardMembers[idx][0].board_id}" boardName="${boardMembers[idx][0].board_name}" onclick="sendMessage(this)">
                                                        <img class="svg" src="../assets/img/svg/send.svg" alt="send"></button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>`;
          boardChatMessageList.innerHTML += chatRoomMessageList;
        }
      });
    },
    error: (error) => {
      console.error(error);
    },
  });
}

async function uploadFile(data) {
  const boardId = data.getAttribute('boardId');
  const boardName = data.getAttribute('boardName');
  const form = new FormData();
  const file = document.querySelector(`#message-file-upload${boardId}`).files[0];

  if (!file) {
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '10MB이하의 파일만 업로드 가능합니다.',
    });
    return;
  }
  let fileUrl;
  const originalname = file.name;
  let date, messageId;

  form.append('newFile', file);
  form.append('originalname', file.name);

  await $.ajax({
    method: 'POST',
    url: `/boardMessages/${boardId}/upload`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    processData: false,
    contentType: false,
    data: form,
    success: (data) => {
      fileUrl = data.fileUrl;
      date = data.date;
      messageId = data.messageId;
    },
    error: (error) => {
      console.error(error);
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
  const message = `<a class="color-white" href="${fileUrl}" target="_blank">${originalname}</a>`;
  date = new Date(new Date(date).getTime() - offset);

  socket.emit('chatMessage', {
    messageId,
    message,
    room: `room${boardId}`,
    boardName,
    date,
    profileUrl: loginProfileUrl,
    fileUpload: true,
    sendUserId: loginUserId,
  });
  document.querySelector(`#message-file-upload${boardId}`).value = '';
}

function sendMessage(data) {
  const boardId = data.getAttribute('id');
  const boardName = data.getAttribute('boardName');

  sendRoomMessage(`room${boardId}`, boardName);
}

async function sendRoomMessage(roomId, boardName) {
  const inputMessage = document.getElementById(`${roomId}-messageInput`);
  const message = inputMessage.value;

  if (message.trim() !== '') {
    const boardId = roomId.replace('room', '');
    const messageId = await saveMessage(boardId, message);

    if (messageId) {
      const date = new Date(Date.now());

      socket.emit('chatMessage', {
        messageId,
        message,
        room: roomId,
        boardName,
        date,
        profileUrl: loginProfileUrl,
        fileUpload: false,
        sendUserId: loginUserId,
      });
      inputMessage.value = '';
    }
  }
}

async function saveMessage(boardId, message) {
  let messageId;
  await $.ajax({
    method: 'POST',
    url: `/boardMessages/${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ message }),
    success: (data) => {
      messageId = data.messageId;
    },
    error: (error) => {
      console.error(error);
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      }).then(() => {
        window.location.href = '/chat';
      });
      return false;
    },
  });
  return messageId;
}

async function uploadPrivateFile(data) {
  const roomId = data.getAttribute('roomId');
  const roomName = data.getAttribute('roomName');
  const userList = data
    .getAttribute('userList')
    .split(' ')
    .filter((id) => id !== loginUserId);
  const form = new FormData();
  const file = document.querySelector(`#message-file-upload${roomId}`).files[0];

  if (!file) {
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '10MB이하의 파일만 업로드 가능합니다.',
    });
    return;
  }
  let fileUrl;
  const originalname = file.name;
  let date, messageId;

  form.append('newFile', file);
  form.append('originalname', file.name);

  const messageRoomId = roomId.replace('privateRoom', '');
  await $.ajax({
    method: 'POST',
    url: `/directMessages/${messageRoomId}/upload`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    processData: false,
    contentType: false,
    data: form,
    success: (data) => {
      fileUrl = data.fileUrl;
      date = data.date;
      messageId = data.messageId;
    },
    error: (error) => {
      console.error(error);
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
  const message = `<a class="color-white" href="${fileUrl}" target="_blank">${originalname}</a>`;
  date = new Date(new Date(date).getTime() - offset);

  socket.emit('chatPrivateMessage', {
    messageId,
    message,
    room: roomId,
    roomName,
    date,
    profileUrl: loginProfileUrl,
    fileUpload: true,
    receiverId: userList[0],
  });
  document.querySelector(`#message-file-upload${roomId}`).value = '';
}

function sendPrivateMessage(data) {
  const roomId = data.getAttribute('id');
  const roomName = data.getAttribute('roomName');
  const userList = data
    .getAttribute('userList')
    .split(' ')
    .filter((id) => id !== loginUserId);

  sendPrivateRoomMessage(roomId, roomName, userList[0]);
}

async function sendPrivateRoomMessage(roomId, roomName, receiverId) {
  const inputMessage = document.getElementById(`${roomId}-messageInput`);
  const message = inputMessage.value;

  if (message.trim() !== '') {
    const roomIds = roomId.replace('privateRoom', '');
    const messageId = await savePrivateMessage(roomIds, message);

    if (messageId) {
      const date = new Date(Date.now());

      socket.emit('chatPrivateMessage', {
        messageId,
        message,
        room: roomId,
        roomName,
        date,
        profileUrl: loginProfileUrl,
        fileUpload: false,
        receiverId,
      });
      inputMessage.value = '';
    }
  }
}

async function savePrivateMessage(roomId, message) {
  let messageId;
  await $.ajax({
    method: 'POST',
    url: `/directMessages/${roomId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ message }),
    success: (data) => {
      messageId = data.messageId;
    },
    error: (error) => {
      console.error(error);
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      }).then(() => {
        window.location.href = '/chat';
      });
      return false;
    },
  });
  return messageId;
}

function appendMessage(
  userId,
  userName,
  messageId,
  message,
  room,
  date,
  boardName,
  profileUrl,
  fileUpload,
  sendUserId
) {
  const chatList = document.getElementById(`${room}-chat-list`);
  let time = new Date(new Date(date).getTime()).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loginUserId / 1 === userId) {
    if (fileUpload) message = message.replace('class="color-white"', 'class="color-gray"');

    //내가 보낸 메시지
    const messageHtml = `<!-- Start: Outgoing -->
                            <div class="flex-1 justify-content-end d-flex outgoing-chat mt-20">
                                <div class="chat-text-box">
                                  <div class="media ">
                                      <div class="media-body">
                                        <div class="chat-text-box__content">
                                            <div class="chat-text-box__title d-flex align-items-center justify-content-end mb-2">
                                              <span class="chat-text-box__time fs-12 color-light fw-400">${time}</span>
                                            </div>
                                            <div class="d-flex align-items-center justify-content-end">
                                              <div class="chat-text-box__other d-flex">
                                                  <div class="px-15">

                                                    <div class="dropdown dropdown-click">
                                                        <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                          <img src="../assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                                        </button>
                                                        <div class="dropdown-default dropdown-bottomRight dropdown-menu-right dropdown-menu" style="">
                                                        <button class="dropdown-item" id="${messageId}" onclick="deleteMessage(this)">삭제하기</button>
                                                      </div>
                                                    </div>

                                                  </div>
                                              </div>
                                              <div class="chat-text-box__subtitle p-20 bg-deep">
                                                  <p class="color-gray">${message}</p>
                                              </div>

                                            </div>
                                        </div>
                                      </div>
                                  </div>
                                </div>
                            </div>
                          <!-- End: Outgoing  -->`;
    chatList.innerHTML += messageHtml;
  } else {
    //상대방이 보낸 메시지
    const messageHtml = `<!-- Start: Incomming -->
                            <div class="flex-1 incoming-chat">
                              <div class="chat-text-box ">
                                  <div class="media d-flex">
                                    <div class="chat-text-box__photo ">
                                        <img src="${profileUrl}" class="align-self-start me-15 wh-46" data-bs-toggle="modal" data-bs-target="#new-member${userId}" alt="img" />
                                    </div>
                                    <div class="media-body">
                                        <div class="chat-text-box__content">
                                          <div class="chat-text-box__title d-flex align-items-center">
                                              <h6 class="fs-14">${userName}</h6>
                                              <span class="chat-text-box__time fs-12 color-light fw-400 ms-15">${time}</span>
                                          </div>
                                          <div class="d-flex align-items-center mb-20 mt-10">
                                              <div class="chat-text-box__subtitle p-20 bg-primary">
                                                <p class="color-white">${message}</p>
                                              </div>
                                              <div class="chat-text-box__other d-flex">
                                                <div class="chat-text-box__reaction px-sm-15 px-2">
                                                </div>
                                              </div>
                                          </div>
                                        </div>
                                    </div>
                                  </div>
                              </div>
                            </div>
                          <!-- End: Incomming -->`;
    chatList.innerHTML += messageHtml;
  }

  if (fileUpload) {
    message = `<p>${userName} : 파일을 보냈습니다.</p>`;
    localStorage.setItem(`recentMessage-${room}`, message);
  } else {
    //최근 메시지는 로컬스토리지에 저장
    message = `<p>${userName} : ${message}</p>`;
    localStorage.setItem(`recentMessage-${room}`, `${message}!@#${date}`);
  }
  localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);

  // 스크롤 아래로 이동
  chatList.scrollTop = chatList.scrollHeight;
  localStorage.removeItem('myMessage');

  if (sendUserId === loginUserId) {
    localStorage.setItem('myMessage', true);
    localStorage.setItem(`recentTime-${room}`, date);
  } else localStorage.setItem('myMessage', false);

  socket.emit('newMessage', {
    message,
    room,
    boardName,
    date,
    profileUrl,
  });
}

function appendPrivateMessage(userId, userName, messageId, message, room, date, profileUrl, fileUpload, receiverId) {
  const chatList = document.getElementById(`${room}-chat-list`);
  let time = new Date(new Date(date).getTime()).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (loginUserId / 1 === userId) {
    if (fileUpload) message = message.replace('class="color-white"', 'class="color-gray"');

    //내가 보낸 메시지
    const messageHtml = `<!-- Start: Outgoing -->
                            <div class="flex-1 justify-content-end d-flex outgoing-chat mt-20">
                                <div class="chat-text-box">
                                  <div class="media ">
                                      <div class="media-body">
                                        <div class="chat-text-box__content">
                                            <div class="chat-text-box__title d-flex align-items-center justify-content-end mb-2">
                                              <span class="chat-text-box__time fs-12 color-light fw-400">${time}</span>
                                            </div>
                                            <div class="d-flex align-items-center justify-content-end">
                                              <div class="chat-text-box__other d-flex">
                                                  <div class="px-15">

                                                    <div class="dropdown dropdown-click">
                                                        <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                          <img src="../assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                                        </button>
                                                        <div class="dropdown-default dropdown-bottomRight dropdown-menu-right dropdown-menu" style="">
                                                        <button class="dropdown-item" id="${messageId}" onclick="deletePrivateMessage(this)">삭제하기</button>
                                                      </div>
                                                    </div>

                                                  </div>
                                              </div>
                                              <div class="chat-text-box__subtitle p-20 bg-deep">
                                                  <p class="color-gray">${message}</p>
                                              </div>

                                            </div>
                                        </div>
                                      </div>
                                  </div>
                                </div>
                            </div>
                          <!-- End: Outgoing  -->`;
    chatList.innerHTML += messageHtml;
  } else {
    //상대방이 보낸 메시지
    const messageHtml = `<!-- Start: Incomming -->
                            <div class="flex-1 incoming-chat">
                              <div class="chat-text-box ">
                                  <div class="media d-flex">
                                    <div class="chat-text-box__photo ">
                                        <img src="${profileUrl}" class="align-self-start me-15 wh-46" data-bs-toggle="modal" data-bs-target="#new-member${userId}" alt="img" />
                                    </div>
                                    <div class="media-body">
                                        <div class="chat-text-box__content">
                                          <div class="chat-text-box__title d-flex align-items-center">
                                              <h6 class="fs-14">${userName}</h6>
                                              <span class="chat-text-box__time fs-12 color-light fw-400 ms-15">${time}</span>
                                          </div>
                                          <div class="d-flex align-items-center mb-20 mt-10">
                                              <div class="chat-text-box__subtitle p-20 bg-primary">
                                                <p class="color-white">${message}</p>
                                              </div>
                                              <div class="chat-text-box__other d-flex">
                                                <div class="chat-text-box__reaction px-sm-15 px-2">
                                                </div>
                                              </div>
                                          </div>
                                        </div>
                                    </div>
                                  </div>
                              </div>
                            </div>
                          <!-- End: Incomming -->`;
    chatList.innerHTML += messageHtml;
  }

  // 스크롤 아래로 이동
  chatList.scrollTop = chatList.scrollHeight;

  if (receiverId === loginUserId) return;
  socket.emit('newPrivateMessage', {
    receiverId,
    room,
    userName,
    date,
  });
}

function updateChatList(userName, message, room, boardName, date, profileUrl, fileUpload) {
  const chatList = document.querySelector(`#recentChatList-${room}`);
  let time = new Date(new Date(date).getTime()).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (fileUpload) message = '파일을 보냈습니다. ';

  const chatListHtml = `<div class="avatar avatar-circle ms-0">
                          <img
                            src="${profileUrl}"
                            class="rounded-circle wh-46 d-flex bg-opacity-primary"
                            alt="image"
                          />
                        </div>
                        <div class="users-list-body">
                          <div class="users-list-body-title">
                            <h6>${boardName}</h6>
                            <div class="text-limit" data-maxlength="10">
                              <p class="mb-0">
                                <span>${userName} : ${message} </span> 
                              </p>
                            </div>
                          </div>
                          <div class="last-chat-time unread">
                            <small>${time}</small>
                          </div>
                        </div>`;
  chatList.innerHTML = chatListHtml;
}

socket.on(
  'chatMessage',
  ({ userId, userName, messageId, message, room, boardName, date, profileUrl, fileUpload, sendUserId }) => {
    updateChatList(userName, message, room, boardName, date, profileUrl, fileUpload);
    appendMessage(userId, userName, messageId, message, room, date, boardName, profileUrl, fileUpload, sendUserId);
  }
);

socket.on(
  'chatPrivateMessage',
  ({ userId, userName, messageId, message, room, roomName, date, profileUrl, fileUpload, receiverId }) => {
    updateChatList(userName, message, room, roomName, date, profileUrl, fileUpload);
    appendPrivateMessage(userId, userName, messageId, message, room, date, profileUrl, fileUpload, receiverId);
  }
);

function deleteMessage(data) {
  const messageId = data.getAttribute('id');
  if (confirm('정말 메시지를 삭제하시겠습니까? ')) {
    $.ajax({
      method: 'DELETE',
      url: `/boardMessages/${messageId}`,
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
          title: 'Success',
          text: data.message,
        }).then(() => {
          window.location.reload();
        });
        return;
      },
      error: (error) => {
        console.error(error);
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
  return;
}

function deletePrivateMessage(data) {
  const messageId = data.getAttribute('id');
  if (confirm('정말 메시지를 삭제하시겠습니까? ')) {
    $.ajax({
      method: 'DELETE',
      url: `/directMessages/${messageId}`,
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
          title: 'Success',
          text: data.message,
        }).then(() => {
          window.location.reload();
        });
        return;
      },
      error: (error) => {
        console.error(error);
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
  return;
}

function getMemberList() {
  const memberResult = document.querySelector('#memberResult');

  if (memberIdList.length > 0) {
    memberIdList.forEach((id, idx) => {
      if (id === loginUserId) return;
      const memberHtml = `<div style="margin: 10px auto 0 5%" >
                            <input type="radio"
                            name="chatUser"
                            value="${id}" /> ${memberNameList[idx]}
                          </div>`;
      memberResult.innerHTML += memberHtml;
    });
  }
}

function searchEmail() {
  const searchResult = document.querySelector('#searchResult');
  const email = document.querySelector('#searchEmail').value;
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

function createUserInfoModal() {
  const main = document.querySelector('#main');

  if (memberIdList.length > 0) {
    memberIdList.forEach((id, idx) => {
      if (id === loginUserId) return;
      const img = memberProfileUrlList[idx] ? memberProfileUrlList[idx] : '../assets/img/favicon.png';
      let phoneNumber;
      if (memberPhoneList[idx] !== '번호 등록 안됨') {
        if (memberPhoneList[idx].length === 11) {
          phoneNumber = `${memberPhoneList[idx].substring(0, 3)} - ${memberPhoneList[idx].substring(
            3,
            7
          )} - ${memberPhoneList[idx].substring(7, 11)}`;
        } else {
          phoneNumber = `${memberPhoneList[idx].substring(0, 3)} - ${memberPhoneList[idx].substring(
            3,
            6
          )} - ${memberPhoneList[idx].substring(6, 10)}`;
        }
      } else phoneNumber = '번호 등록 안됨';

      const modalHtml = ` <!-- Modal -->
                          <div class="modal fade show new-member new-member__2" id="new-member${id}" role="dialog" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                              <div class="modal-content  radius-xl">
                                <div class="modal-header">
                                  <h5 class="modal-title fw-500" id="staticBackdropLabel" style="font-weight:bold">프로필 정보</h5>
                                  <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close" >
                                    <img src="./assets/img/svg/x.svg" alt="x" class="svg">
                                  </button>
                                </div>
                                <div class="modal-body">
                                  <div class="new-member-modal">
                                    <div class="card position-relative user-member-card">
                                      <div class="card-body text-center p-30">
                                        <div class="ap-img d-flex justify-content-center">
                                          <!-- Profile picture image-->
                                          <img class="ap-img__main rounded-circle mb-20 bg-opacity-primary wh-150" src="${img}" alt="profile">
                                        </div>
                                        <div class="ap-nameAddress pb-3" >
                                          <h2 class="ap-nameAddress__title" style="font-weight:bold; padding-top:10px">${memberNameList[idx]}</h2>
                                          <div style="display: inline-flex; margin-top:5%">
                                            <div class="c-info-item-icon" style="margin-right: 20px; margin-left:20px; padding-top:10px">
                                              <img src="./assets/img/svg/phone.svg" alt="phone" class="svg" style="padding-bottom:10px" />
                                              <br/>
                                              <p class="c-info-item-text">
                                              ${phoneNumber}
                                              </p>
                                            </div>
                                            <div class="c-info-item-icon" style="margin-left: 20px; padding-top:10px">
                                              <img src="./assets/img/svg/mail.svg" alt="mail" class="svg"style="padding-bottom:10px" />
                                              <br/>
                                              <p class="c-info-item-text" >
                                                ${memberEmailList[idx]}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="ap-img d-flex justify-content-center" style="display: inline-flex; margin-top:4%">
                                    <button class="btn btn-primary btn-default btn-squared text-capitalize" id=${id} onclick="movePrivateChat(this)">메시지 전송</button>
                                    <button class="btn btn-primary btn-default btn-squared text-capitalize" style="margin-left:30px" id=${id} name=${memberNameList[idx]} onclick="inviteVideoCall(this)">영상 통화</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <!-- Modal -->`;
      main.innerHTML += modalHtml;
    });
  }

  if (privateMemberIdList.length > 0) {
    privateMemberIdList.forEach((id, idx) => {
      if (id === loginUserId) return;
      if (document.querySelector(`#new-member${id}`)) return;
      const img = privateRoomProfileUrlList[idx] ? privateRoomProfileUrlList[idx] : '../assets/img/favicon.png';

      let phoneNumber;
      if (privateRoomPhoneList[idx] !== '번호 등록 안됨') {
        if (privateRoomPhoneList[idx].length === 11) {
          phoneNumber = `${privateRoomPhoneList[idx].substring(0, 3)} - ${privateRoomPhoneList[idx].substring(
            3,
            7
          )} - ${privateRoomPhoneList[idx].substring(7, 11)}`;
        } else {
          phoneNumber = `${privateRoomPhoneList[idx].substring(0, 3)} - ${privateRoomPhoneList[idx].substring(
            3,
            6
          )} - ${privateRoomPhoneList[idx].substring(6, 10)}`;
        }
      } else phoneNumber = '번호 등록 안됨';
      const modalHtml = ` <!-- Modal -->
                          <div class="modal fade show new-member new-member__2" id="new-member${id}" role="dialog" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                              <div class="modal-content  radius-xl">
                                <div class="modal-header">
                                  <h5 class="modal-title fw-500" id="staticBackdropLabel" style="font-weight:bold">프로필 정보</h5>
                                  <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close" >
                                    <img src="./assets/img/svg/x.svg" alt="x" class="svg">
                                  </button>
                                </div>
                                <div class="modal-body">
                                  <div class="new-member-modal">
                                    <div class="card position-relative user-member-card">
                                      <div class="card-body text-center p-30">
                                        <div class="ap-img d-flex justify-content-center">
                                          <!-- Profile picture image-->
                                          <img class="ap-img__main rounded-circle mb-20 bg-opacity-primary wh-150" src="${img}" alt="profile">
                                        </div>
                                        <div class="ap-nameAddress pb-3" >
                                          <h2 class="ap-nameAddress__title" style="font-weight:bold; padding-top:10px">${privateRoomNameList[idx]}</h2>
                                          <div style="display: inline-flex; margin-top:5%">
                                            <div class="c-info-item-icon" style="margin-right: 20px; margin-left:20px; padding-top:10px">
                                              <img src="./assets/img/svg/phone.svg" alt="phone" class="svg" style="padding-bottom:10px" />
                                              <br/>
                                              <p class="c-info-item-text">
                                              ${phoneNumber}
                                              </p>
                                            </div>
                                            <div class="c-info-item-icon" style="margin-left: 20px; padding-top:10px">
                                              <img src="./assets/img/svg/mail.svg" alt="mail" class="svg"style="padding-bottom:10px" />
                                              <br/>
                                              <p class="c-info-item-text" >
                                                ${privateRoomEmailList[idx]}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="ap-img d-flex justify-content-center" style="display: inline-flex; margin-top:4%">
                                    <button class="btn btn-primary btn-default btn-squared text-capitalize" id=${id} onclick="movePrivateChat(this)">메시지 전송</button>
                                    <button class="btn btn-primary btn-default btn-squared text-capitalize" style="margin-left:30px" id=${id} name=${privateRoomNameList[idx]} onclick="inviteVideoCall(this)">영상 통화</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <!-- Modal -->`;
      main.innerHTML += modalHtml;
    });
  }
}

async function createChatRoom() {
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

  if (userId === loginUserId) {
    document.querySelector('#main').append(
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: '자기 자신은 채팅에 초대할 수 없습니다. ',
      })
    );
    return;
  }

  await $.ajax({
    method: 'POST',
    url: `/userMessageRooms/${userId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      const roomId = data.roomId;
      window.location.href = `/chat?roomId=${roomId}`;
    },
  });
}

async function getPrivateChatRooms() {
  let loginUserName;
  await $.ajax({
    method: 'GET',
    url: `/userMessageRooms/${privateRoomId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      const { rooms, messages } = await data;
      loginUserName = data.userName;
      if (rooms) {
        rooms.forEach((room, idx) => {
          let userId, userName, userEmail, userPhoneNumber, userProfileUrl;
          let messageInfos = [];
          const lastMessageInfo = messages[idx][messages[idx].length - 1];

          if (room.sender_id === loginUserId) {
            userId = room.receiver_id;
            userName = room.receiver_name;
            userEmail = room.receiver_email;
            userPhoneNumber = room.receiver_phone_number ? room.receiver_phone_number : '번호 등록 안됨';
            userProfileUrl = room.receiver_profile_url;
          } else {
            userId = room.sender_id;
            userName = room.sender_name;
            userEmail = room.sender_email;
            userPhoneNumber = room.sender_phone_number ? room.sender_phone_number : '번호 등록 안됨';
            userProfileUrl = room.sender_profile_url;
          }
          privateRoomIdList.push(room.room_id);
          privateMemberIdList.push(userId);
          privateRoomNameList.push(userName);
          privateRoomEmailList.push(userEmail);
          privateRoomPhoneList.push(userPhoneNumber);
          privateRoomProfileUrlList.push(userProfileUrl);

          let sendTime, sendTimeDiv, img, lastMessage, active, ariaSelected, activeMessage;
          if (lastMessageInfo) {
            lastMessage = lastMessageInfo.message_file_url
              ? '<span>파일을 보냈습니다. <span>'
              : lastMessageInfo.message_message.length > 15
              ? `<span>${lastMessageInfo.user_name} : ${
                  lastMessageInfo.message_message.substring(0, 15) + '...'
                } </span> `
              : `<span>${lastMessageInfo.user_name} : ${lastMessageInfo.message_message} </span> `;
            sendTime = new Date(new Date(lastMessageInfo.message_created_at).getTime() - offset).toLocaleString(
              'ko-KR',
              {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }
            );
            sendTimeDiv = `<div class="last-chat-time unread">
                              <small>${sendTime}</small>
                            </div>`;
            img = lastMessageInfo.user_profile_url ? lastMessageInfo.user_profile_url : '../assets/img/favicon.png';
          } else {
            lastMessage = `<span>메시지가 없습니다. </span>`;
            sendTimeDiv = '';
            img = '../assets/img/favicon.png';
          }

          if (privateRoomId && room.room_id === privateRoomId) {
            active = `nav-link active`;
            ariaSelected = 'true';
            activeMessage = `fade show active`;
          } else {
            active = `nav-link`;
            ariaSelected = 'false';
            activeMessage = `fade `;
          }
          const chatListHtml = `<a class="${active}" id="chat-list-privateRoom${room.room_id}-tab" href="#chat-list-privateRoom${room.room_id}" role="tab" data-bs-toggle="pill" aria-selected="${ariaSelected}" style="width:409px">
                                  <li class="user-list-item">
                                    <div class="user-list-item__wrapper" id="recentChatList-privateRoom${room.room_id}">
                                      <div class="avatar avatar-circle ms-0">
                                        <img
                                          src="${img}"
                                          class="rounded-circle wh-46 d-flex bg-opacity-primary"
                                          alt="image"
                                        />
                                      </div>
                                      <div class="users-list-body">
                                        <div class="users-list-body-title">
                                          <h6>${userName}</h6>
                                          <div class="text-limit" data-maxlength="10">
                                            <p class="mb-0">
                                              ${lastMessage}
                                            </p>
                                          </div>
                                        </div>
                                        ${sendTimeDiv}
                                      </div>
                                    </div>
                                  </li>
                                </a>`;

          privateChatList.innerHTML += chatListHtml;

          if (messages[idx].length) {
            //DB에 저장된 메시지들 생성
            messages[idx].forEach((message) => {
              let time = new Date(new Date(message.message_created_at).getTime() - offset).toLocaleString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });
              if (message.user_id === loginUserId) {
                const userMessage = message.message_message
                  ? message.message_message
                  : `<a class="color-gray" href="${message.message_file_url}" target="_blank">${message.message_file_original_name}</a>`;
                // 내가 보낸 메시지
                const messageHtml = `<!-- Start: Outgoing -->
                                      <div class="flex-1 justify-content-end d-flex outgoing-chat mt-20">
                                          <div class="chat-text-box">
                                            <div class="media ">
                                                <div class="media-body">
                                                  <div class="chat-text-box__content">
                                                      <div class="chat-text-box__title d-flex align-items-center justify-content-end mb-2">
                                                        <span class="chat-text-box__time fs-12 color-light fw-400">${time}</span>
                                                      </div>
                                                      <div class="d-flex align-items-center justify-content-end">
                                                        <div class="chat-text-box__other d-flex">
                                                            <div class="px-15">

                                                              <div class="dropdown dropdown-click">
                                                                  <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                    <img src="../assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                                                  </button>
                                                                  <div class="dropdown-default dropdown-bottomRight dropdown-menu-right dropdown-menu" style="">
                                                                    <button class="dropdown-item" id="${message.message_id}" onclick="deletePrivateMessage(this)">삭제하기</button>
                                                                  </div>
                                                              </div>

                                                            </div>
                                                        </div>
                                                        <div class="chat-text-box__subtitle p-20 bg-deep">
                                                            <p class="color-gray">${userMessage}</p>
                                                        </div>

                                                      </div>
                                                  </div>
                                                </div>
                                            </div>
                                          </div>
                                      </div>
                                    <!-- End: Outgoing  -->`;
                messageInfos.push(messageHtml);
              } else {
                const userMessage = message.message_message
                  ? message.message_message
                  : `<a class="color-white" href="${message.message_file_url}" target="_blank">${message.message_file_original_name}</a>`;
                const img = message.user_profile_url ? message.user_profile_url : '../assets/img/favicon.png';
                //상대방이 보낸 메시지
                const messageHtml = `<!-- Start: Incomming -->
                                        <div class="flex-1 incoming-chat">
                                          <div class="chat-text-box ">
                                              <div class="media d-flex">
                                                <div class="chat-text-box__photo ">
                                                    <img src="${img}" class="align-self-start me-15 wh-46" data-bs-toggle="modal" data-bs-target="#new-member${message.user_id}" alt="img" />
                                                </div>
                                                <div class="media-body">
                                                    <div class="chat-text-box__content">
                                                      <div class="chat-text-box__title d-flex align-items-center">
                                                          <h6 class="fs-14">${message.user_name}</h6>
                                                          <span class="chat-text-box__time fs-12 color-light fw-400 ms-15">${time}</span>
                                                      </div>
                                                      <div class="d-flex align-items-center mb-20 mt-10">
                                                          <div class="chat-text-box__subtitle p-20 bg-primary">
                                                            <p class="color-white">${userMessage}</p>
                                                          </div>
                                                          <div class="chat-text-box__other d-flex">
                                                            <div class="chat-text-box__reaction px-sm-15 px-2">
                                                            </div>
                                                          </div>
                                                      </div>
                                                    </div>
                                                </div>
                                              </div>
                                          </div>
                                        </div>
                                      <!-- End: Incomming -->`;
                messageInfos.push(messageHtml);
              }
            });
            messageInfos = messageInfos.join('\n');
          } else {
            messageInfos = '';
          }
          const chatRoomMessageList = `<div class="tab-pane ${activeMessage}" id="chat-list-privateRoom${rooms[idx].room_id}" role="tabpanel" aria-labelledby="chat-list-privateRoom${rooms[idx].room_id}-tab" >
                                        <div class="chat" >
                                          <div class="chat-body bg-white radius-xl">
                                            <div class="chat-header">
                                              <div class="media chat-name align-items-center">
                                                <div class="media-body align-self-center">
                                                  <h5 class="mb-0 fw-500 text-uppercase">${userName}</h5>
                                                </div>
                                              </div>
                                              <ul class="nav flex-nowrap">
                                                <li class="nav-item list-inline-item d-none d-sm-block me-0">
                                                  <div class="dropdown">
                                                    <a href="#" role="button" title="Details" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                      <img class="svg" src="../assets/img/svg/more-vertical.svg" alt="more-vertical">
                                                    </a>
                                                    <div class="dropdown-menu dropdown-menu-right">
                                                      <a class="dropdown-item align-items-center d-flex cursor-true" id="${rooms[idx].room_id}" onclick="deletePrivateRoom(this)">
                                                        <img class="svg" src="../assets/img/svg/trash-2.svg" alt="" >
                                                        <span>채팅방 나가기</span>
                                                      </a>
                                                    </div>
                                                  </div>
                                                </li>
                                              </ul>
                                            </div>
                                            <div class="chat-box chat-box--big p-xl-30 ps-lg-20 pe-lg-0" id="privateRoom${rooms[idx].room_id}-chat-list">
                                            ${messageInfos}
                                            </div>
                                            <div class="chat-footer px-xl-30 px-lg-20 pb-lg-30 pt-1">
                                              <div class="chat-type-text">
                                                <div
                                                  class="pt-0 outline-0 pb-0 pe-0 ps-0 rounded-0 position-relative d-flex align-items-center"
                                                  tabindex="-1"
                                                >
                                                  <div class="d-flex justify-content-between align-items-center w-100 flex-wrap">
                                                    <div class="flex-1 d-flex align-items-center chat-type-text__write ms-0">
                                                      <input class="form-control border-0 bg-transparent" id="privateRoom${rooms[idx].room_id}-messageInput" roomName="${userName}" placeholder="메시지를 입력해 주세요. " />
                                                    </div>
                                                    <div class="chat-type-text__btn">
                                                      <button  class="border-0 btn-deep color-light wh-50 p-10 rounded-circle">
                                                        <input id="message-file-uploadprivateRoom${rooms[idx].room_id}" type="file" name="newFile" class="d-none" userList="${rooms[idx].sender_id} ${rooms[idx].receiver_id}" roomId="privateRoom${rooms[idx].room_id}" roomName="${userName}" onchange="uploadPrivateFile(this)" />
                                                        <label for="message-file-uploadprivateRoom${rooms[idx].room_id}" >
                                                          <img class="svg" src="../assets/img/svg/paperclip.svg" alt="paperclip" style="cursor: pointer">
                                                        </label>
                                                      </button>
                                                      <button type="button" class="border-0 btn-primary wh-50 p-10 rounded-circle" userList="${rooms[idx].sender_id} ${rooms[idx].receiver_id}" id="privateRoom${rooms[idx].room_id}" roomName="${userName}" onclick="sendPrivateMessage(this)">
                                                      <img class="svg" src="../assets/img/svg/send.svg" alt="send"></button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>`;
          boardChatMessageList.innerHTML += chatRoomMessageList;
        });
      }
    },
    error: (error) => {
      console.log(error);
    },
  });

  joinPrivateRoom(privateRoomIdList, loginUserName);
}

function joinPrivateRoom(rooms, name) {
  rooms.forEach((roomId) => {
    socket.emit('join', { room: 'privateRoom' + roomId, name });
  });
}

function deleteToggleActive() {
  const groupTab = document.querySelector('#first-tab');
  const privateTab = document.querySelector('#second-tab');

  groupTab.addEventListener('click', () => {
    if (privateRoomIdList.length) {
      privateRoomIdList.forEach((roomId) => {
        const privateTabs = document.getElementById(`chat-list-privateRoom${roomId}-tab`);
        privateTabs.classList.remove('active');
      });
    }
  });

  privateTab.addEventListener('click', () => {
    if (myBoardIds.length) {
      myBoardIds.forEach((boardId) => {
        const groupTabs = document.getElementById(`chat-list-room${boardId}-tab`);
        groupTabs.classList.remove('active');
      });
    }
  });
}

function deletePrivateRoom(data) {
  if (confirm('대화방에서 나가시면 대화 창의 모든 기록이 삭제되고 복구하실 수 없습니다. 나가시겠습니까? ')) {
    const roomId = data.getAttribute('id');
    let notificationRoomId;
    if (localStorage.getItem('notification-message')) {
      notificationRoomId = localStorage.getItem('notification-message').split(' ')[0].replace('privateRoom', '');
    } else notificationRoomId = 0;

    $.ajax({
      method: 'DELETE',
      url: `/userMessageRooms/${roomId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'success',
          title: 'Success',
          text: data.message,
        }).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        console.error(error);
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

    if (roomId === notificationRoomId) {
      localStorage.removeItem('notification-message');
    }
  }
}

function movePrivateChat(data) {
  const userId = data.getAttribute('id');
  $.ajax({
    method: 'POST',
    url: `/userMessageRooms/${userId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      const roomId = data.roomId;
      window.location.href = `/chat?roomId=${roomId}`;
    },
  });
}

function searchChatRoomEvent() {
  const searchForm = document.querySelector('#searchRoom');
  const searchInput = document.querySelector('#searchChatRoom');

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const keyword = searchInput.value;
    if (myBoardNames.length) {
      myBoardNames.forEach((title, idx) => {
        const chatList = document.querySelector(`#chat-list-room${myBoardIds[idx]}-tab`);
        if (title.includes(keyword)) {
          chatList.style.display = 'block';
        } else {
          chatList.style.display = 'none';
        }
      });
    }

    if (privateRoomNameList.length) {
      privateRoomNameList.forEach((title, idx) => {
        const privateChatList = document.querySelector(`#chat-list-privateRoom${privateRoomIdList[idx]}-tab`);
        if (title.includes(keyword)) {
          privateChatList.style.display = 'block';
        } else {
          privateChatList.style.display = 'none';
        }
      });
    }
  });
}

function inviteVideoCall(data) {
  const receiverId = data.getAttribute('id');
  const receiverName = data.getAttribute('name');

  window.open(
    `/videoCall?senderId=${loginUserId}&senderName=${loginUserName}&receiverId=${receiverId}&receiverName=${receiverName}`,
    '_blank',
    'width=860, height=730'
  );
}
