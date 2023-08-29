const logoutBtn = document.querySelector('#logoutBtn');
const workspaceList = document.querySelector('.workspace-list');
const accessToken = document.cookie.split(';')[0].split('=')[1];
let boardIds = [];
let boardNames = [];

$(document).ready(async () => {
  await getWorkspaces();
  await getMyBoardMessage();
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
      text: err.responseJSON.message,
    });
  }
}

async function getMyBoardMessage() {
  const messageList = document.getElementById('recentMessageList');
  const recentMessageContainer = document.getElementById('recentMessageContainer');
  let room = [];
  let name;
  await $.ajax({
    method: 'GET',
    url: '/boards/getBoards/joinBoards',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}
{
  /* <li class="author-online has-new-message">
                        <div class="user-avater">
                          <img src="../assets/img/team-1.png" alt="" />
                        </div>
                        <div class="user-message">
                          <p>
                            <a href="" class="subject stretched-link text-truncate" style="max-width: 180px"
                              >Web Design</a
                            >
                            <span class="time-posted">3 hrs ago</span>
                          </p>
                          <p>
                            <span class="desc text-truncate" style="max-width: 215px"
                              >Lorem ipsum dolor amet cosec Lorem ipsum</span
                            >
                            <span class="msg-count badge-circle badge-success badge-sm">1</span>
                          </p>
                        </div>
                      </li> */
}
