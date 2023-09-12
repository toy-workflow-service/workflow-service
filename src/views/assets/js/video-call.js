const params = new URLSearchParams(window.location.search);
const senderId = params.get('senderId');
const senderName = params.get('senderName');
const receiverId = params.get('receiverId');
const receiverName = params.get('receiverName');

let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');
const audioBtn = document.getElementById('audio');
const cameraBtn = document.getElementById('camera');
const screenShareBtn = document.getElementById('screen-share');
const leaveBtn = document.getElementById('leave-room');

let roomId = params.get('callRoomId');
let localStream;
let peerConnection;
let peerInfo = {};
let selectedCandidate = {};
let muted = false;
let cameraOff = false;
let tempLocalStream, tempRemoteStream;
let loginUserId;

$(document).ready(async () => {
  if (!senderId || !senderName || !receiverId || !receiverName || !Number(senderId) || !Number(receiverId)) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: '비정상적인 접근',
      text: `잘못된 접근 방식입니다.  `,
    }).then(() => {
      window.close();
    });
    return;
  }

  roomId = roomId ? roomId : 0;
  await useMedia();
  //수신 수락을 눌렀을 때 상대방에서 실행되는 소켓
  if (roomId) {
    await socket.emit('callRoomJoin', { callRoomId: roomId, senderId, senderName, receiverId, receiverName });
    document.querySelector('#myName').innerHTML += receiverName;
    document.querySelector('#peerName').innerHTML += senderName;
  } else {
    await socket.emit('existUser', { senderId });
  }

  if (document.readyState === 'complete') {
    if (!roomId) {
      socket.emit('refreshRoom', { callRoomId: `callRoom${senderId}` });
    }
  } else if (document.readyState === 'loading') {
    socket.emit('leaveRoom', { callRoomId: `callRoom${senderId}` });
  }
});

async function inviteVideoCall() {
  //최초로 영상통화를 걸었을 때 실행되는 소켓
  await socket.emit('inviteVideoCall', { senderId, senderName, receiverId, receiverName });
  document.querySelector('#myName').innerHTML += senderName;
  document.querySelector('#peerName').innerHTML += receiverName;
}

const getMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream = stream;
    localVideo.srcObject = stream;
    tempLocalStream = stream;
  } catch (error) {
    console.log(error);
  }
};

const useMedia = async () => {
  await getMedia();
};

const icecandidate = (data) => {
  if (data.candidate) {
    socket.emit('callIceCandidate', { candidate: data.candidate, callRoomId: roomId });
  }
};

const addStream = (data) => {
  remoteVideo.autoplay = true;
  remoteVideo.srcObject = data.stream;
  tempRemoteStream = data.stream;
};

const makePeerConnect = async (userId) => {
  peerInfo[userId] = new Object();
  peerInfo[userId].peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
        urls: 'stun:stun1.l.google.com:19302',
        urls: 'stun:stun2.l.google.com:19302',
      },
    ],
  });
  peerInfo[userId].peerConnection.addEventListener('icecandidate', icecandidate);
  peerInfo[userId].peerConnection.addEventListener('addstream', addStream);

  for (let track of localStream.getTracks()) {
    await peerInfo[userId].peerConnection.addTrack(track, localStream);
  }
};

function handleAudioClick() {
  localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

  if (!muted) {
    audioBtn.innerText = '음소거 해제';
  } else {
    audioBtn.innerText = '음소거';
  }
  muted = !muted;
}

function handleCameraClick() {
  localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!cameraOff) {
    cameraBtn.innerText = '카메라 켜기';
  } else {
    cameraBtn.innerText = '카메라 끄기';
  }
  cameraOff = !cameraOff;
}

// 화면 공유
async function screenShare() {
  try {
    if (screenShareBtn.innerText === '화면 공유') {
      screenShareBtn.innerText = '화면 공유 중';

      navigator.mediaDevices
        .getDisplayMedia({ video: { cursor: 'always' }, audio: { echoCancellation: true, noiseSuppression: true } })
        .then(async (stream) => {
          localVideo.srcObject = stream;
          const videoTrack = stream.getVideoTracks()[0];
          peerInfo[loginUserId].peerConnection
            .getSenders()
            .find((sender) => sender.track.kind === videoTrack.kind)
            .replaceTrack(videoTrack);
          videoTrack.onended = () => {
            const screenTrack = localStream.getVideoTracks()[0];
            peerInfo[loginUserId].peerConnection
              .getSenders()
              .find((sender) => sender.track.kind === screenTrack.kind)
              .replaceTrack(screenTrack);
            stream.getTracks().forEach((track) => track.stop());
            localVideo.srcObject = tempLocalStream;
          };
        });
    } else {
      screenShareBtn.innerText = '화면 공유';
      const screenTrack = localStream.getVideoTracks()[0];
      peerInfo[loginUserId].peerConnection
        .getSenders()
        .find((sender) => sender.track.kind === screenTrack.kind)
        .replaceTrack(screenTrack);
      localVideo.srcObject.getTracks().forEach((track) => track.stop());
      localVideo.srcObject = tempLocalStream;
    }
  } catch (err) {
    console.error(err);
  }
}

function leaveRoom() {
  localVideo.srcObject.getTracks().forEach((track) => track.stop());
  socket.emit('leaveRoom', { callRoomId: roomId });
  window.close();
}

socket.on('duplicateEntry', async ({ result }) => {
  if (!result) inviteVideoCall();
  else {
    await Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: '중복 입장 오류',
      text: `이미 영상채팅 방에 들어와 있습니다. `,
    }).then(() => {
      window.close();
    });
    return;
  }
});

socket.on('refuseVideoCall', ({ receiverName }) => {
  //여기서는 영상통화가 거절되었다고 나오게 하면 된다.
  Swal.fire({
    customClass: {
      container: 'my-swal',
    },
    icon: 'warning',
    title: '영상통화 거절',
    text: `${receiverName}님이 영상통화를 거절하였습니다. `,
  }).then(() => {
    window.close();
  });
});

socket.on('callRoomEnter', async ({ userId, callRoomId }) => {
  if (!roomId) roomId = callRoomId;
  await makePeerConnect(userId);
  const offer = await peerInfo[userId].peerConnection.createOffer();
  await peerInfo[userId].peerConnection.setLocalDescription(offer);
  socket.emit('callOffer', { offer, callRoomId });
});

socket.on('callRoomOffer', async ({ userId, offer, callRoomId }) => {
  if (!peerInfo[userId]) {
    await makePeerConnect(userId);
    await peerInfo[userId].peerConnection.setRemoteDescription(offer);

    const answer = await peerInfo[userId].peerConnection.createAnswer(offer);

    peerInfo[userId].peerConnection.setLocalDescription(answer);
    socket.emit('callAnswer', { answer, toUserId: userId, callRoomId });
  }
});

socket.on('callRoomAnswer', async ({ userId, answer, toUserId }) => {
  if (peerInfo[toUserId] === undefined) {
    await peerInfo[userId].peerConnection.setRemoteDescription(answer);
  }
});

socket.on('callIceCandidate', async ({ userId, candidate }) => {
  loginUserId = userId;
  if (selectedCandidate[candidate.candidate] === undefined) {
    selectedCandidate[candidate.candidate] = true;
    await peerInfo[userId].peerConnection.addIceCandidate(candidate);
  }
});

socket.on('leaveRoom', () => {
  Swal.fire({
    customClass: {
      container: 'my-swal',
    },
    icon: 'warning',
    title: '영상채팅 종료',
    text: `대화 상대가 방에서 나가 영상 채팅이 종료됩니다. `,
  }).then(() => {
    window.close();
  });
});

socket.on('refreshRoom', () => {
  window.location.reload();
});

audioBtn.addEventListener('click', handleAudioClick);
cameraBtn.addEventListener('click', handleCameraClick);
screenShareBtn.addEventListener('click', screenShare);
leaveBtn.addEventListener('click', leaveRoom);
if (localVideo)
  localVideo.addEventListener('click', () => {
    const classList = localVideo.classList;
    if (!classList.contains('sizeUp')) {
      localVideo.style.width = '800px';
      localVideo.style.height = '650px';
      localVideo.style.marginLeft = '25px';
      localVideo.classList.add('sizeUp');
      document.getElementById('peer-stream').style.display = 'none';
      document.getElementById('myName').style.fontSize = '40px';
    } else {
      localVideo.style.width = '400px';
      localVideo.style.height = '400px';
      localVideo.style.marginLeft = '0px';
      localVideo.classList.remove('sizeUp');
      document.getElementById('peer-stream').style.display = 'block';
      document.getElementById('myName').style.fontSize = '20px';
    }
  });
if (remoteVideo)
  remoteVideo.addEventListener('click', () => {
    const classList = remoteVideo.classList;
    if (!classList.contains('sizeUp')) {
      remoteVideo.style.width = '800px';
      remoteVideo.style.height = '650px';
      remoteVideo.style.marginLeft = '25px';
      remoteVideo.classList.add('sizeUp');
      document.getElementById('my-stream').style.display = 'none';
      document.getElementById('peerName').style.fontSize = '40px';
    } else {
      remoteVideo.style.width = '400px';
      remoteVideo.style.height = '400px';
      remoteVideo.style.marginLeft = '0px';
      remoteVideo.classList.remove('sizeUp');
      document.getElementById('my-stream').style.display = 'block';
      document.getElementById('peerName').style.fontSize = '20px';
    }
  });
