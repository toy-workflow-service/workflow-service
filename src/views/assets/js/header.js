const logoutBtn = document.querySelector('#logoutBtn');
const accessToken = localStorage.getItem('accessToken');
const workspaceList = document.querySelector('.workspace-list');

$(document).ready(async () => {
  if (getCookie('accessToken')) setAccessToken();
  await getWorkspaces();
});

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

function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );

  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1900 00:00:00 UTC; path=/;';
}

function setAccessToken() {
  const token = getCookie('accessToken');
  localStorage.setItem('accessToken', token);
  deleteCookie('accessToken');
  window.location.reload();
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

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
