const kakaoLoginBtn = document.querySelector('.kakaoLogin');
const googleLoginBtn = document.querySelector('.googleLogin');
const naverLoginBtn = document.querySelector('.naverLogin');
const sendMailBtn = document.querySelector('#mailBtn');
const signupBtn = document.querySelector('#signupBtn');
let emailAuth = false;

async function sendMail() {
  const emailReg = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w)*(\.\w{2,3})+$/);
  const email = document.querySelector('#email').value;
  const verifyCodeDiv = document.querySelector('#verifyCodeDiv');
  const verifyCodeBtn = document.querySelector('#verifyCodeBtn');
  let code, expireTime;

  if (!email || !emailReg.test(email)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: '이메일이 비어 있거나 이메일이 형식에 맞지 않습니다.',
    });
    return;
  }

  await $.ajax({
    type: 'POST',
    url: '/mail',
    headers: {
      Accept: 'application/json',
    },
    data: { email },
    success: (data) => {
      [code, expireTime] = [data.code, data.expireTime];
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message,
      });

      verifyCodeDiv.style = 'display: block';
      return;
    },
    error: (error) => {
      console.log(error);
      if (error.responseJSON.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.responseJSON.message[0],
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.responseJSON,
        });
      }
      verifyCodeDiv.style = 'display: none';
      return;
    },
  });

  verifyCodeBtn.addEventListener('click', () => {
    const verifyCode = document.querySelector('#verifyCode').value;
    if (verifyCode === code && Date.now() < expireTime) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: '인증에 성공하셨습니다.',
      });
      emailAuth = true;
      document.querySelector('#email').readOnly = true;
      verifyCodeDiv.style = 'display:none';
      sendMailBtn.style.display = 'none';
      return;
    } else if (verifyCode !== code && Date.now() < expireTime) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '인증번호가 다릅니다. 인증번호를 다시 확인해 주세요. ',
      });
      document.querySelector('#verifyCode').value = '';
      return;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '인증시간이 초과되었습니다. 처음부터 다시 시도해 주세요. ',
      });
      document.querySelector('#email').value = '';
      document.querySelector('#verifyCode').value = '';
      verifyCodeDiv.style = 'display:none';
      return;
    }
  });
}

function signup() {
  const form = new FormData();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#passwordInput').value;
  const confirmPassword = document.querySelector('#confirmPasswordInput').value;
  const name = document.querySelector('#name').value;
  const phoneNumber = document.querySelector('#phoneNumber').value;
  const newFile = document.querySelector('#upload-1').files[0];

  if (document.querySelector('#email').readOnly === false) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: '이메일 인증을 해주세요.',
    });
    return;
  }
  if (newFile) {
    form.append('newFile', newFile);
  }

  form.append('email', email);
  form.append('name', name);
  form.append('password', password);
  form.append('confirmPassword', confirmPassword);
  form.append('phone_number', phoneNumber);
  form.append('emailAuth', emailAuth);

  $.ajax({
    type: 'POST',
    url: '/users/signup',
    processData: false,
    contentType: false,
    data: form,
    success: (data) => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        window.location.href = '/login';
      });
    },
    error: (error) => {
      console.log(error);
      if (error.responseJSON.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.responseJSON.message[0],
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.responseJSON,
        });
      }
      return;
    },
  });
}

function googleLogin() {
  window.location.href =
    `https://accounts.google.com/o/oauth2/auth?client_id=1098266876328-ibg7lfkte0358vsqt5cprv6akf1l2mdq.apps.googleusercontent.com` +
    '&redirect_uri=' +
    encodeURIComponent(`http://127.0.0.1:3000/socialLogin/google`) +
    '&response_type=code' +
    '&scope=email profile';
}

function kakaoLogin() {
  window.location.href =
    `https://kauth.kakao.com/oauth/authorize?client_id=6cdf7b0e538d88b2284a5dee284f9b5b&redirect_uri=` +
    encodeURIComponent(`http://127.0.0.1:3000/socialLogin/kakao`) +
    '&response_type=code';
}

function naverLogin() {
  window.location.href =
    `https://nid.naver.com/oauth2.0/authorize?client_id=xt0v4KWDrbjwuiriRYkt&redirect_uri=` +
    encodeURIComponent(`http://127.0.0.1:3000/socialLogin/naver`) +
    '&response_type=code';
}

$('.btn-delete').click(() => {
  $(this).remove();
});

sendMailBtn.addEventListener('click', sendMail);
signupBtn.addEventListener('click', signup);
kakaoLoginBtn.addEventListener('click', kakaoLogin);
googleLoginBtn.addEventListener('click', googleLogin);
naverLoginBtn.addEventListener('click', naverLogin);
