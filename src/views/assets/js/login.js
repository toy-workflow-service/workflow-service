const loginBtn = document.querySelector('#loginBtn');
const kakaoLoginBtn = document.querySelector('.kakaoLogin');
const googleLoginBtn = document.querySelector('.googleLogin');
const naverLoginBtn = document.querySelector('.naverLogin');

$(document).ready(() => {
  const emailInput = document.querySelector('#emailInput');
  const passwordInput = document.querySelector('#passwordInput');

  emailInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      login();
    }
  });
  passwordInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      login();
    }
  });
});

function login() {
  const email = document.querySelector('#emailInput').value;
  const password = document.querySelector('#passwordInput').value;

  $.ajax({
    method: 'POST',
    url: '/users/login',
    headers: {
      Accept: 'application/json',
    },
    data: { email, password },
    success: (data) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        window.localStorage.clear();
        window.location.href = '/';
      });
      return;
    },
    error: (error) => {
      console.log(error);
      if (error.responseJSON.message) {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'Error',
          text: error.responseJSON.message[0],
        });
      } else {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
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
    encodeURIComponent(`https://work-flow.online/socialLogin/google`) +
    '&response_type=code' +
    '&scope=email profile';
}

function kakaoLogin() {
  window.location.href =
    `https://kauth.kakao.com/oauth/authorize?client_id=6cdf7b0e538d88b2284a5dee284f9b5b&redirect_uri=` +
    encodeURIComponent(`https://work-flow.online/socialLogin/kakao`) +
    '&response_type=code';
}

function naverLogin() {
  window.location.href =
    `https://nid.naver.com/oauth2.0/authorize?client_id=xt0v4KWDrbjwuiriRYkt&redirect_uri=` +
    encodeURIComponent(`https://work-flow.online/socialLogin/naver`) +
    '&response_type=code';
}

loginBtn.addEventListener('click', login);
kakaoLoginBtn.addEventListener('click', kakaoLogin);
googleLoginBtn.addEventListener('click', googleLogin);
naverLoginBtn.addEventListener('click', naverLogin);
