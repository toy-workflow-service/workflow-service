$(document).ready(async () => {
  await getWorkspaces();
  await getWorkspaceDetail(); // 임시
});

const accessToken = localStorage.getItem('accessToken');
const workspaceList = document.querySelector('.workspace-list');

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
                            <a href="/boards?workspaceId=${workspace.id}">${workspace.name}</a>
                          </li>`;
          workspaceList.innerHTML += result;
        });
      },
    });
  } catch (err) {
    console.error(err);
  }
}

/* 여기서부터 board.ejs로 들어갈 예정 */
// 워크스페이스 상세조회
async function getWorkspaceDetail() {
  try {
    const workspaceId = 1;
    await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        console.log(data);
      },
    });
  } catch (err) {
    console.error(err);
  }
}
