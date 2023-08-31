const params = new URLSearchParams(window.location.search);
let callerName = params.get('callerName');
let receiverName = params.get('receiverName');

socket.on('connect', async () => {
  await initCall();
  socket.emit('joinRoom', { callerName, receiverName });
  console.log('Web-RTC 소켓 연결');
});

const callRoom = document.getElementById('call-room');
const myVideo = document.getElementById('my-video');
const audioBtn = document.getElementById('audio');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('camera-select');
const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat');
const screenShareBtn = document.getElementById('screen-share');
const leaveBtn = document.getElementById('leave-room');
const myName = document.getElementById('my-name');
const peerName = document.getElementById('peer-name');

myName.textContent = callerName;
peerName.textContent = receiverName;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let nickname;
let myPeerConnection;
let myDataChannel;
let captureStream;

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

// 오디오와 비디오 스트림 설정
async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log('Media stream retrieved:', myStream);
    myVideo.srcObject = myStream;
    await getCamera();
  } catch (err) {
    console.error(err);
  }
}

function handleAudioClick() {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

  if (!muted) {
    audioBtn.innerText = '음소거 해제';
  } else {
    audioBtn.innerText = '음소거';
  }
  muted = !muted;
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!cameraOff) {
    cameraBtn.innerText = '카메라 켜기';
  } else {
    cameraBtn.innerText = '카메라 끄기';
  }
  cameraOff = !cameraOff;
}

// 카메라 변경
async function handleCameraChange() {
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { deviceId: { exact: cameraSelect.value } }, // 선택한 카메라 deviceId를 사용
    });

    myStream.getVideoTracks()[0].stop();
    myStream.removeTrack(myStream.getVideoTracks()[0]);

    const newVideoTrack = newStream.getVideoTracks()[0];
    myStream.addTrack(newVideoTrack);

    const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(newVideoTrack);

    myVideo.srcObject = myStream;
  } catch (err) {
    console.error(err);
  }
}

audioBtn.addEventListener('click', handleAudioClick);
cameraBtn.addEventListener('click', handleCameraClick);
cameraSelect.addEventListener('change', handleCameraChange);
screenShareBtn.addEventListener('click', screenShare);

// 화면 공유
async function screenShare() {
  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const screenVideo = document.querySelector('#screen-video');
    screenVideo.srcObject = captureStream;

    // 유저 스크린이 아래로 내려가는 효과 추가
    const userScreens = document.querySelector('.user-screen');
    userScreens.forEach((screen) => {
      screen.style.transition = 'transform 0.3s ease';
      screen.style.transform = 'translateY(100%)';
    });

    // 화면 공유 영역 표시
    const screenStream = document.getElementById('screen-stream');
    screenStream.style.display = 'block';
  } catch (err) {
    console.error(err);
  }
}

function leaveRoom() {
  socket.disconnect();
  myStream.getTracks().forEach((track) => track.stop);
}

async function initCall() {
  await getMedia();
}

socket.on('welcome', async (roomName) => {
  try {
    makeConnection(roomName);
    myDataChannel = myPeerConnection.createDataChannel('chat');
    myDataChannel.addEventListener('message', addMessage);

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit('sendOffer', { offer, roomName });
  } catch (err) {
    console.log(err);
  }
});

socket.on('receiveOffer', async (offer) => {
  const remoteOffer = new RTCSessionDescription({
    type: 'offer',
    sdp: offer.payload.sdp,
  });
  if (myPeerConnection.signalingState === 'stable') {
    try {
      await myPeerConnection.setRemoteDescription(remoteOffer);

      const answer = await myPeerConnection.createAnswer();
      await myPeerConnection.setLocalDescription(answer);
      socket.emit('sendAnswer', { answer, roomName: offer.roomName });
    } catch (error) {
      console.error('SDP 파싱 오류', error);
    }
  } else {
    console.log('stable 상태가 아님');
  }
});

socket.on('receiveAnswer', async (answer) => {
  if (myPeerConnection.signalingState === 'have-local-offer') {
    try {
      await myPeerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('SDP 파싱 오류', error);
    }
  } else {
    console.log('have-local-offer 상태가 아님');
  }
});

socket.on('receiveIce', (ice) => {
  try {
    myPeerConnection.addIceCandidate(ice);
    console.log('receive ice');
  } catch (err) {
    console.error(err);
  }
});

function handleIce(data, roomName) {
  socket.emit('sendIce', { data: data.candidate, roomName });
  console.log('send ice');
}

function handleAddStream(data) {
  try {
    console.log('스트림', myPeerConnection);
    const peerVideo = document.querySelector('#peer-video');
    const peerStream = data.streams[0];
    peerVideo.srcObject = peerStream;
    console.log('peer와 스트림 연결');
    console.log('peers', data);
    console.log('peers', peerVideo.srcObject);
    console.log('my', myStream);
  } catch (err) {
    console.error(err);
  }
}

function makeConnection(roomName) {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', (event) => {
    console.log('아이스 이벤트 발생');
    if (event.candidate) {
      handleIce(event.candidate, roomName);
    }
  });
  console.log('커넥션', myPeerConnection);
  // addstream은 사용하지 말라고 함
  // addtrack 사용
  myPeerConnection.addEventListener('track', handleAddStream);
  myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function addMessage(e) {
  const li = document.createElement('li');
  li.innerHTML = e.data;
  messages.append(li);
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = chatForm.querySelector('input');
  console.log(myDataChannel);
  myDataChannel.send(`${nickname}: ${input.value}`);
  addMessage({ data: `You: ${input.value}` });
  input.value = '';
}

chatForm.addEventListener('submit', handleChatSubmit);
