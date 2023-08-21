const accessToken = localStorage.getItem('accessToken');

$(document).ready(async () => {
  await getWorkspaces();
});

// 내 프로젝트 조회
async function getWorkspaces() {
  await $.ajax({
    method: 'GET',
    url: `/workspaces`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log(data);
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'error',
        text: error.responseJSON.message,
      }).then(() => (window.location.href = '/'));
    },
  });
}
