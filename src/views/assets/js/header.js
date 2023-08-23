$(document).ready(async () => {
  await getWorkspaces();
});

const logoutBtn = document.querySelector('#logoutBtn');
const accessToken = localStorage.getItem('accessToken');
const workspaceList = document.querySelector('.workspace-list');

function logout() {
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

// 워크스페이스 조회
async function getWorkspaces() {
  try {
    await $.ajax({
      method: 'GET',
      url: `/workspaces`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        data.forEach((workspace) => {
          const result = `<li class="">
                            <a href="/workspace?workspaceId=${workspace.id}">${workspace.name}</a>
                          </li>`;
          workspaceList.innerHTML += result;
        });
      },
    });
  } catch (err) {
    console.error(err);
  }
}
