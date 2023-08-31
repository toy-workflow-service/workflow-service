const socket = io.connect('/');

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
