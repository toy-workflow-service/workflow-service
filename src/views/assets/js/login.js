const loginBtn = document.querySelector('#loginBtn');

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
        icon: 'success',
        title: 'Success',
        text: data.message,
      }).then(() => {
        window.location.href = '/';
      });
      return;
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message[0],
      });
      return;
    },
  });
}

loginBtn.addEventListener('click', login);
