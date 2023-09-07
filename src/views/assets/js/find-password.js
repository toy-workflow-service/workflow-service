const sendMailBtn = document.querySelector('#mailBtn');
const changePasswordBtn = document.querySelector('#changePasswordBtn');
const sendingMessage = document.querySelector('#sending-message');
let emailAuth = false;

$(document).ready(() => {
  const mailInput = document.querySelector('#mail');

  mailInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      sendMail();
    }
  });
});

async function sendMail() {
  const mailReg = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w)*(\.\w{2,3})+$/);
  const mail = document.querySelector('#mail').value;
  const verifyCodeDiv = document.querySelector('#verifyCodeDiv');
  const verifyCodeBtn = document.querySelector('#verifyCodeBtn');
  const changePasswordDiv = document.querySelector('#changePasswordDiv');
  let code, expireTime;

  sendMailBtn.style.display = 'none';
  sendingMessage.style.display = 'block';
  if (!mail || !mailReg.test(mail)) {
    Swal.fire({
      customClass: {
        container: 'my-swal',
      },
      icon: 'error',
      title: 'Error',
      text: '이메일이 비어 있거나 이메일이 형식에 맞지 않습니다.',
    });
    sendingMessage.style.display = 'none';
    sendMailBtn.style.display = 'block';
    return;
  }

  await $.ajax({
    type: 'POST',
    url: '/users/password/findPassword',
    headers: {
      Accept: 'application/json',
    },
    data: { email: mail },
    success: (data) => {
      sendingMessage.style.display = 'none';
      [code, expireTime] = [data.code, data.expireTime];
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: data.message,
      });
      document.querySelector('#mail').readOnly = true;
      sendingMessage.style.display = 'none';
      verifyCodeDiv.style = 'display: block';
      return;
    },
    error: (error) => {
      console.log(error);
      sendingMessage.style.display = 'none';
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

      sendingMessage.style = 'diplay: none;';
      sendMailBtn.style.display = 'block';
      return;
    },
  });

  verifyCodeBtn.addEventListener('click', () => {
    const verifyCode = document.querySelector('#verifyCode').value;
    if (verifyCode === code && Date.now() < expireTime) {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success',
        text: '인증에 성공하셨습니다.',
      });
      emailAuth = true;
      verifyCodeDiv.style = 'display:none';
      sendMailBtn.style.display = 'none';
      changePasswordDiv.style.display = 'block';
      return;
    } else if (verifyCode !== code && Date.now() < expireTime) {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: '인증번호가 다릅니다. 인증번호를 다시 확인해 주세요. ',
      });
      document.querySelector('#verifyCode').value = '';
      return;
    } else {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: '인증시간이 초과되었습니다. 처음부터 다시 시도해 주세요. ',
      });
      document.querySelector('#mail').readOnly = false;
      document.querySelector('#mail').value = '';
      document.querySelector('#verifyCode').value = '';
      verifyCodeDiv.style = 'display:none';
      sendMailBtn.style.display = 'block';
      return;
    }
  });
}

async function changePassword() {
  const mail = document.querySelector('#mail').value;
  const password = document.querySelector('#passwordInput').value;
  const confirmPassword = document.querySelector('#confirmPasswordInput').value;

  $.ajax({
    method: 'POST',
    url: 'users/password/changePassword',
    headers: {
      Accept: 'application/json',
    },
    data: { email: mail, password, confirmPassword, emailAuth },
    success: (data) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
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

sendMailBtn.addEventListener('click', sendMail);
changePasswordBtn.addEventListener('click', changePassword);
