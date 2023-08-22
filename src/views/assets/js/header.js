const logoutBtn = document.querySelector('#logoutBtn');

function logout() {
  const accessToken = localStorage.getItem('accessToken');
  $.ajax({
    method: 'POST',
    url: '/users/logout',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      localStorage.removeItem('accessToken');
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data.message,
      }).then(() => {
        window.location.href = '/';
      });
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      });
    },
  });
}

logoutBtn.addEventListener('click', logout);
