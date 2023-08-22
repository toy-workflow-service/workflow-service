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
      const { accessToken } = data;
      localStorage.setItem('accessToken', accessToken);
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

loginBtn.addEventListener('click', login);
