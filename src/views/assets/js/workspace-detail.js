$(document).ready(async () => {
  await getWorkspaceDetail();
});

const printTitle = document.querySelector('#workspace-title');
const printDetail = document.querySelector('#workspace-info');

// 워크스페이스 상세조회
async function getWorkspaceDetail() {
  try {
    await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: (data) => {
        let result = '';
        let title = '';
        console.log(data);

        title += `<div class="d-flex align-items-center user-member__title me-sm-25 me-0">
                    <h4 class="text-capitalize fw-500 breadcrumb-title" id="workspace-title">${data.name}</h4>
                  </div>`;

        result += `<div class="col-xxl-6 col-lg-8 mb-25" id="workspace-info">
                    <div class="card border-0 pb-md-50 pb-15">
                      <div class="card-header py-sm-20 py-3 px-sm-25 px-3">
                        <h6>워크스페이스 소개</h6>
                      </div>
                      <div class="card-body">
                        <div class="about-projects">
                          <div class="about-projects__details" id="workspace-desc">
                            <p class="fs-15 mb-25">
                             ${data.description}
                            </p>
                          </div>
                          <ul class="d-flex text-capitalize">
                            <li>
                              <span class="color-light fs-13">워크스페이스생성자</span>
                              <p class="color-dark fs-14 mt-1 mb-0 fw-500" id="workspace-owner"></p>
                            </li>
                            <li>
                              <span class="color-light fs-13">생성일</span>
                              <p class="color-primary fs-14 mt-1 mb-0 fw-500">${data.created_at}</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>`;
        printDetail.innerHTML = result;
        printTitle.innerHTML = title;
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
