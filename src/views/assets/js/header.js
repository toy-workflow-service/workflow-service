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

// 워크스페이스 생성 모달열기
async function openCreateWorkspaceModal() {
  $('#modal-basic4').modal('show');
}

// 워크스페이스 생성
async function createWorkspace() {
  const editModal = document.querySelector('#modal-basic4');
  const titleInput = editModal.querySelector('#create-title').value;
  const descriptionInput = editModal.querySelector('#create-description').value;
  const typeInput = editModal.querySelector('#select-search').value;

  try {
    await $.ajax({
      method: 'POST',
      url: `/workspaces`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name: titleInput, type: typeInput, description: descriptionInput }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'success!',
          text: '워크스페이스 생성 완료',
        }).then(() => {
          $('#modal-basic').modal('hide');
          window.location.reload();
        });
      },
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'error',
      text: err.responseJSON.messagee,
    });
  }
}
