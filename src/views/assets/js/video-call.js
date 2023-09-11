const params = new URLSearchParams(window.location.search);
const senderId = params.get('senderId');
const senderName = params.get('senderName');
const receiverId = params.get('receiverId');
const receiverName = params.get('receiverName');

let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');
const cameraSelect = document.getElementById('camera-select');
const audioBtn = document.getElementById('audio');
const cameraBtn = document.getElementById('camera');

let roomId = params.get('callRoomId');
let localStream;
let peerConnection;
let peerInfo = {};
let selectedCandidate = {};
let muted = false;
let cameraOff = false;

$(document).ready(async () => {
  roomId = roomId ? roomId : 0;
  await useMedia();
  //수신 수락을 눌렀을 때 상대방에서 실행되는 소켓
  if (roomId) {
    await socket.emit('callRoomJoin', { callRoomId: roomId, senderId, senderName, receiverId, receiverName });
    document.querySelector('#myName').innerHTML = receiverName;
    document.querySelector('#peerName').innerHTML = senderName;
  } else {
    //최초로 영상통화를 걸었을 때 실행되는 소켓
    await socket.emit('inviteVideoCall', { senderId, senderName, receiverId, receiverName });
    document.querySelector('#myName').innerHTML = senderName;
    document.querySelector('#peerName').innerHTML = receiverName;
  }
});

const getMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    localStream = stream;
    localVideo.srcObject = stream;
    await getCamera();
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
};

const makePeerConnect = async (userId) => {
  peerInfo[userId] = new Object();
  peerInfo[userId].peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  });
  peerInfo[userId].peerConnection.addEventListener('icecandidate', icecandidate);
  peerInfo[userId].peerConnection.addEventListener('addstream', addStream);

  for (let track of localStream.getTracks()) {
    await peerInfo[userId].peerConnection.addTrack(track, localStream);
  }
};

// 카메라 변경
async function handleCameraChange() {
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: { exact: cameraSelect.value } }, // 선택한 카메라 deviceId를 사용
    });
    console.log(localStream.getVideoTracks());
    localStream.getVideoTracks()[0].stop();
    localStream.removeTrack(localStream.getVideoTracks()[0]);

    const newVideoTrack = newStream.getVideoTracks()[0];
    localStream.addTrack(newVideoTrack);

    const videoSender = peerConnection.getSenders().find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(newVideoTrack);

    localVideo.srcObject = localStream;
  } catch (err) {
    console.error(err);
  }
}

// 카메라 설정
async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');

    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      cameraSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

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
  if (selectedCandidate[candidate.candidate] === undefined) {
    console.log(candidate.candidate);
    selectedCandidate[candidate.candidate] = true;
    await peerInfo[userId].peerConnection.addIceCandidate(candidate);
  }
});

cameraSelect.addEventListener('change', handleCameraChange);
audioBtn.addEventListener('click', handleAudioClick);
cameraBtn.addEventListener('click', handleCameraClick);
