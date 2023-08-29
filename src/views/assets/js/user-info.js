const updateUserInfoBtn = document.querySelector('#updateUserBtn');
const deleteUserBtn = document.querySelector('#deleteUserBtn');
const deleteBtn = document.querySelector('#deleteBtn');
const cancelBtn = document.querySelector('#cancelBtn');
const deleteDiv = document.querySelector('#deleteDiv');
const deleteUserDiv = document.querySelector('#deleteUserDiv');
const changePasswordBtn = document.querySelector('#changePasswordBtn');
const sendBtn = document.querySelector('#sendBtn');
const phoneAuthBtn = document.querySelector('#phoneAuthBtn');
const cancelAuthBtn = document.querySelector('#cancelAuthBtn');
const editBtn = document.querySelector('#editBtn');
const cancelAuthBtn2 = document.querySelector('#cancelAuthBtn2');

function updateUserInfo() {
  const email = document.querySelector('#email45').value;
  const name = document.querySelector('#name1').value;
  const payload = { email, name };

  $.ajax({
    method: 'PATCH',
    url: '/users',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify(payload),
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

function deleteUser() {
  if (confirm('정말로 해당 아이디를 삭제하시겠습니까?')) {
    const password = document.querySelector('#passwordInput').value;
    const payload = { password };
    $.ajax({
      method: 'DELETE',
      url: '/users',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify(payload),
      success: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.message,
        }).then(() => {
          window.location.href = '/';
        });
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
      },
    });
  } else {
    return;
  }
}

function changePassword() {
  const currentPassword = document.querySelector('#passwordInput2').value;
  const newPassword = document.querySelector('#confirmPasswordInput').value;
  const payload = { currentPassword, newPassword };

  $.ajax({
    method: 'PATCH',
    url: '/users/password',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify(payload),
    success: (data) => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        window.location.href = '/';
      });
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
      return;
    },
  });
}

function send() {
  let phoneNumber = document.querySelector('#phoneNumberInput').value;
  phoneNumber = phoneNumber.split('-').join('');
  let code, expireTime, number;
  const payload = { phoneNumber };
  $.ajax({
    method: 'POST',
    url: 'sms',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify(payload),
    success: (data) => {
      [code, expireTime] = [data.code, data.expireTime];
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message,
      });
      sendBtn.style.display = 'none';
      number = phoneNumber;
      document.querySelector('#phoneNumberInput').readOnly = true;
      document.querySelector('#phoneAuthDiv').style.display = 'block';
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
      return;
    },
  });

  phoneAuthBtn.addEventListener('click', () => {
    const verifyCode = document.querySelector('#phoneAuthInput').value;
    if (verifyCode === code && Date.now() < expireTime) {
      const payload = { phoneNumber: number };
      $.ajax({
        method: 'POST',
        url: '/users/phoneAuthentication',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
        },
        data: JSON.stringify(payload),
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.responseJSON.message,
          });
        },
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: '휴대폰 본인 인증에 성공하셨습니다.',
      }).then(() => {
        window.location.reload();
      });
      return;
    } else if (verifyCode !== code && Date.now() < expireTime) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '인증번호가 다릅니다. 인증번호를 다시 확인해 주세요. ',
      });
      document.querySelector('#phoneAuthInput').value = '';
      return;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '인증시간이 초과되었습니다. 처음부터 다시 시도해 주세요. ',
      }).then(() => {
        window.location.reload();
      });
      return;
    }
  });
}

updateUserInfoBtn.addEventListener('click', updateUserInfo);
deleteUserBtn.addEventListener('click', deleteUser);
deleteBtn.addEventListener('click', () => {
  deleteDiv.style = 'display: none';
  deleteUserDiv.style = 'display: inline-flex; width: 100%';
});
cancelBtn.addEventListener('click', () => {
  deleteDiv.style = 'display: inline-flex; width: 100%';
  deleteUserDiv.style = 'display: none; ';
});
changePasswordBtn.addEventListener('click', changePassword);
sendBtn.addEventListener('click', send);
if (cancelAuthBtn) {
  cancelAuthBtn.addEventListener('click', () => {
    document.querySelector('#phoneNumberInput').readOnly = false;
    document.querySelector('#phoneAuthDiv').style.display = 'none';
    sendBtn.style.display = 'block';
    document.querySelector('#phoneNumberInput').value = '';
  });
}
if (cancelAuthBtn2) {
  cancelAuthBtn2.addEventListener('click', () => {
    window.location.reload();
  });
}
editBtn.addEventListener('click', () => {
  document.querySelector('#phoneNumberInput').readOnly = false;
  document.querySelector('#editBtnDiv').style.display = 'none';
  sendBtn.style.display = 'block';
});
