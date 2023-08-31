const boardChatList = document.querySelector('#chat-list-tab');
const boardChatMessageList = document.querySelector('#v-pills-tabContent');
const params = new URLSearchParams(window.location.search);
const offset = 1000 * 60 * 60 * 9;
let boardId = params.get('boardId');
let myBoardIds = [];
let loginUserId;
let loginProfileUrl;

$(document).ready(async () => {
  await getChatRooms();

  myBoardIds.forEach((boardId) => {
    const inputMessage = document.getElementById(`room${boardId}-messageInput`);
    const boardName = inputMessage.getAttribute('boardName');

    inputMessage.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        sendRoomMessage(`room${boardId}`, boardName);
      }
    });
  });
});

async function getChatRooms() {
  if (!boardId) boardId = 0;
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
      loginProfileUrl = data.userProfileUrl ? data.userProfileUrl : '../assets/img/favicon.png';

      boardMembers.forEach((result, idx) => {
        myBoardIds.push(result[0].board_id);
        let active;
        if (idx === 0) {
          active = `nav-link active`;
        } else {
          active = `nav-link`;
        }
        if (messageList[idx].length > 0) {
          const lastMessageInfo = messageList[idx][messageList[idx].length - 1];
          const img = lastMessageInfo.user_profile_url ? lastMessageInfo.user_profile_url : '../assets/img/favicon.png';
          let sendTime = new Date(new Date(lastMessageInfo.message_created_at).getTime() + offset).toLocaleString();
          if (sendTime.length === 24) sendTime = sendTime.substring(0, 21);
          else sendTime = sendTime.substring(0, 20);

          let message = lastMessageInfo.message_message ? lastMessageInfo.message_message : '파일을 보냈습니다. ';
          if (message.length > 15) {
            message = message.substring(0, 15) + '...';
          }
          const chatListHtml = `<a class="${active}" id="chat-list-room${lastMessageInfo.board_id}-tab" href="#chat-list-room${lastMessageInfo.board_id}" role="tab" data-bs-toggle="pill" aria-selected="false">
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
          const chatListHtml = `<a class="${active}" id="chat-list-room${result[0].board_id}-tab" href="#chat-list-room${result[0].board_id}" role="tab" data-bs-toggle="pill" aria-selected="false">
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
        if (idx === 0) {
          activeMessage = `fade show active`;
        } else {
          activeMessage = `fade`;
        }
        let boardMemberPhoto = boardMembers[idx].map((member) => {
          const img = member.user_profile_url ? member.user_profile_url : '../assets/img/favicon.png';
          return `<li style="margin-left: 5px">
                    <img id="photo${member.user_id}" src="${img}" alt="img" class="wh-30 rounded-circle" />
                  </li>`;
        });
        boardMemberPhoto = boardMemberPhoto.join('\n');

        if (list.length === 0) {
          const chatRoomMessageList = `<div class="tab-pane ${activeMessage}" id="chat-list-room${boardMembers[idx][0].board_id}" role="tabpanel" aria-labelledby="chat-list-room${boardMembers[idx][0].board_id}-tab">
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
                                              </div>
                                              <div class="chat-footer px-xl-30 px-lg-20 pb-lg-30 pt-1">
                                                <div class="chat-type-text">
                                                  <div
                                                    class="pt-0 outline-0 pb-0 pe-0 ps-0 rounded-0 position-relative d-flex align-items-center"
                                                    tabindex="-1"
                                                  >
                                                    <div class="d-flex justify-content-between align-items-center w-100 flex-wrap">
                                                      <div class="flex-1 d-flex align-items-center chat-type-text__write ms-0">
                                                        <div class="emotions">
                                                          <div class="dropdown dropdown-click">
                                                            <button
                                                              class="btn-link border-0 bg-transparent p-0"
                                                              data-bs-toggle="dropdown"
                                                              aria-haspopup="true"
                                                              aria-expanded="false"
                                                            >
                                                              <img class="svg" src="../assets/img/svg/smile.svg" alt="smile" />
                                                            </button>
                                                            <div class="dropdown-default dropdown-bottomLeft dropdown-menu-left dropdown-menu">
                                                              <ul class="emotions__parent d-flex">
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/cool.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/happy2.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/happy.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/shocked.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/like.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/heart.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                              </ul>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <input class="form-control border-0 bg-transparent" id="room${boardMembers[idx][0].board_id}-messageInput" boardName="${boardMembers[idx][0].board_name}" placeholder="메시지를 입력해 주세요. " />
                                                      </div>
                                                      <div class="chat-type-text__btn">                                                      
                                                        <button  class="border-0 btn-deep color-light wh-50 p-10 rounded-circle">
                                                          <input id="message-file-upload${boardMembers[idx][0].board_id}" type="file" name="newFile" class="d-none" boardId="${boardMembers[idx][0].board_id}" onchange="uploadFile(this)" />
                                                          <label for="message-file-upload${boardMembers[idx][0].board_id}" >
                                                            <img class="svg" src="../assets/img/svg/paperclip.svg" alt="paperclip">
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
            let time = new Date(new Date(data.message_created_at).getTime() + offset).toLocaleString();
            if (time.length === 24) time = time.substring(0, 21);
            else time = time.substring(0, 20);

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
                                                <img src="${img}" class="align-self-start me-15 wh-46" alt="img">
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
          const chatRoomMessageList = `<div class="tab-pane ${activeMessage}" id="chat-list-room${boardMembers[idx][0].board_id}" role="tabpanel" aria-labelledby="chat-list-room${boardMembers[idx][0].board_id}-tab">                                         
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
                                                        <div class="emotions">
                                                          <div class="dropdown dropdown-click">
                                                            <button
                                                              class="btn-link border-0 bg-transparent p-0"
                                                              data-bs-toggle="dropdown"
                                                              aria-haspopup="true"
                                                              aria-expanded="false"
                                                            >
                                                              <img class="svg" src="../assets/img/svg/smile.svg" alt="smile" />
                                                            </button>
                                                            <div class="dropdown-default dropdown-bottomLeft dropdown-menu-left dropdown-menu">
                                                              <ul class="emotions__parent d-flex">
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/cool.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/happy2.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/happy.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/shocked.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/like.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                                <li>
                                                                  <a class="" href="#">
                                                                    <img src="../assets/img/svg/heart.png" alt="emotions" />
                                                                  </a>
                                                                </li>
                                                              </ul>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <input class="form-control border-0 bg-transparent" id="room${boardMembers[idx][0].board_id}-messageInput" boardName="${boardMembers[idx][0].board_name}" placeholder="메시지를 입력해 주세요. " />
                                                      </div>
                                                      <div class="chat-type-text__btn">
                                                        <button  class="border-0 btn-deep color-light wh-50 p-10 rounded-circle">
                                                          <input id="message-file-upload${boardMembers[idx][0].board_id}" type="file" name="newFile" class="d-none" boardId="${boardMembers[idx][0].board_id}" boardName="${boardMembers[idx][0].board_name}" onchange="uploadFile(this)" />
                                                          <label for="message-file-upload${boardMembers[idx][0].board_id}" >
                                                            <img class="svg" src="../assets/img/svg/paperclip.svg" alt="paperclip">
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

  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: '5MB이하의 파일만 업로드 가능합니다.',
    });
    return;
  }
  let fileUrl;
  const originalname = file.name;
  let date;
  let messageId;

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
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
      return;
    },
  });
  const message = `<a class="color-white" href="${fileUrl}" target="_blank">${originalname}</a>`;
  date = new Date(new Date(date).getTime() + offset);

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
        icon: 'error',
        title: 'Error',
        text: error.responseJSON,
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
  boardName,
  date,
  profileUrl,
  fileUpload,
  sendUserId
) {
  const chatList = document.getElementById(`${room}-chat-list`);
  let time = new Date(new Date(date).getTime()).toLocaleString();
  if (time.length === 24) time = time.substring(0, 21);
  else time = time.substring(0, 20);

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
                                        <img src="${profileUrl}" class="align-self-start me-15 wh-46" alt="img">
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
    localStorage.setItem(`recentMessage-${room}`, message);
  }
  localStorage.setItem(`recentProfileUrl-${room}`, profileUrl);

  // 스크롤 아래로 이동
  chatList.scrollTop = chatList.scrollHeight;

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

function updateChatList(userName, message, room, boardName, date, profileUrl, fileUpload) {
  const chatList = document.querySelector(`#recentChatList-${room}`);
  let time = new Date(new Date(date).getTime()).toLocaleString();
  if (time.length === 24) time = time.substring(0, 21);
  else time = time.substring(0, 20);
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
    appendMessage(userId, userName, messageId, message, room, boardName, date, profileUrl, fileUpload, sendUserId);
  }
);

function deleteMessage(data) {
  const messageId = data.getAttribute('id');
  if (confirm('정말 메시지를 삭제하시겠습니까? ')) {
    $.ajax({
      method: 'DELETE',
      url: `boardMessages/${messageId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        Swal.fire({
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
