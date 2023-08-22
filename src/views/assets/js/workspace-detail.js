$(document).ready(async () => {
  await getWorkspaceDetail();
});

const accessToken = localStorage.getItem('accessToken');
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

// 워크스페이스 수정

async function updateWorkspace() {
  try {
    const workspaceId = 1;
    await $.ajax({
      method: 'PATCH',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name, type, description }),
      success: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'success!',
          text: '워크스페이스 수정 완료',
        }).then(() => {
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
