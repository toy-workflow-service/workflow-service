const callRoom = document.getElementById('call-room');
const myVideo = document.getElementById('my-video');
const audioBtn = document.getElementById('audio');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('camera-select');
const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat');
const screenShareBtn = document.getElementById('screen-share');
const leaveBtn = document.getElementById('leave-room');

callRoom.style.display = 'column';

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let nickname;
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

// 소켓코드
// peer A가 통화를 시작하며 room 생성
socket.on('createRoom', async (data) => {
  console.log(data);
  await initCall();

  socket.on('joinRoom');
});

// socket.on('acceptCall' async)
