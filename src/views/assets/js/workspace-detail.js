const params = new URLSearchParams(window.location.search);
let workspaceId = params.get('workspaceId');

$(document).ready(async () => {
  await getWorkspaceDetail();
});

const printTitle = document.querySelector('#workspace-title');
const printDetail = document.querySelector('#workspace-card');
const printTotal = document.querySelector('#workspace-total');
const printMemory = document.querySelector('#workspace-memory');
const printMember = document.querySelector('#workspace-member');

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
      success: async (data) => {
        let result = '';
        let title = '';
        let totalData = '';
        let memberHtml = '';
        let remaingMemory = '';

        const countBoards = await countWorkspaceBoards(data.id);
        const countCards = await countWorkspaceCards(data.id);

        title += `<h4 class="text-capitalize fw-500 breadcrumb-title" id="workspace-title">${data.name}</h4>
                  `;

        result += `<div class="card border-0 pb-md-50 pb-15" id="workspace-card">
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
                              <p class="color-dark fs-14 mt-1 mb-0 fw-500" id="workspace-owner">${
                                data.workspace_members[0].user.name
                              }</p>
                            </li>
                            <li>
                              <span class="color-light fs-13">생성일</span>
                              <p class="color-primary fs-14 mt-1 mb-0 fw-500">${data.created_at
                                .substring(0, 10)
                                .replace('-', '.')
                                .replace('-', '.')}</p>
                            </li>
                          </ul>
                        </div>
                      </div>`;

        totalData += `<div class="card mt-25">
                        <div class="card-body">
                          <div class="application-task d-flex align-items-center mb-25">
                            <div class="application-task-icon wh-60 bg-opacity-secondary content-center">
                              <img class="svg wh-25 text-secondary" src="./assets/img/svg/at.svg" alt="img" />
                            </div>
                            <div class="application-task-content">
                              <h4>${countBoards}</h4>
                              <span class="text-light fs-14 mt-1 text-capitalize">생성된 보드 개수</span>
                            </div>
                          </div>
                          <div class="application-task d-flex align-items-center mb-25">
                            <div class="application-task-icon wh-60 bg-opacity-primary content-center">
                              <img class="svg wh-25 text-primary" src="./assets/img/svg/grid.svg" alt="img" />
                            </div>
                            <div class="application-task-content">
                              <h4>${countCards || 0}</h4>
                              <span class="text-light fs-14 mt-1 text-capitalize">생성된 카드 개수</span>
                            </div>
                          </div>
                          <div class="application-task d-flex align-items-center mb-25">
                            <div class="application-task-icon wh-60 bg-opacity-primary content-center">
                              <img class="svg wh-25 text-primary" src="./assets/img/svg/contact.svg" alt="img" />
                            </div>
                            <div class="application-task-content">
                              <h4>${data.workspace_members.length}</h4>
                              <span class="text-light fs-14 mt-1 text-capitalize">참여중인 멤버</span>
                            </div>
                          </div>
                        </div>
                      </div>`;

        remaingMemory += `<div class="projects-tab-content mb-30">
                                <div class="row">
                                  <div class="col-xxl-3 col-lg-4 mb-25" id="workspace-memory">
                                    <div class="progress-box px-25 pt-25 pb-10 bg-success radius-xl">
                                      <div class="d-flex justify-content-between mb-3">
                                        <h6 class="text-white fw-500 fs-16 text-capitalize">Memory</h6>
                                        <span class="progress-percentage text-white fw-500 fs-16 text-capitalize">64%</span>
                                      </div>
                                      <div class="progress-wrap d-flex align-items-center mb-15">
                                        <div class="progress progress-height">
                                          <div
                                            class="progress-bar bg-white"
                                            role="progressbar"
                                            style="width: 64%"
                                            aria-valuenow="64"
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          ></div>
                                        </div>
                                      </div>
                                    </div>`;

        data.workspace_members.forEach(async (member) => {
          let memberRole = '';
          if (member.role === 1) memberRole = 'Admin';
          if (member.role === 2) memberRole = 'Manager';
          if (member.role === 3) memberRole = 'Member';
          if (member.role === 4) memberRole = 'OutSourcing';
          const user = member.user;
          let Img = '';
          user.profile_url ? (Img = `${user.profile_url}`) : (Img = `/assets/img/favicon.png`);
          memberHtml += `<div class="d-flex align-items-center mb-25">
                      <img src="${Img}" class="wh-46 me-15" alt="img" />
                        <div >
                          <p class="fs-14 fw-600 color-dark mb-0">${memberRole} ${user.name}</p>
                          <span class="mt-1 fs-14 color-light">${user.email}</span>
                        </div>
                        <div class="files-area__right">
                          <div class="dropdown dropleft">
                            <button
                              class="btn-link border-0 bg-transparent p-0"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg" />
                            </button>
                            <div class="dropdown-menu dropdown-menu--dynamic">
                              <a class="dropdown-item" data-rid-id="${user.id}" onclick="openEditMemberModal(this)">edit</a>
                              <a class="dropdown-item" data-rid-id="${user.id}" onclick="deleteMember(this)">delete</a>
                            </div>
                          </div>
                        </div>
                      </div>`;
        });
        printDetail.innerHTML = result;
        printTitle.innerHTML = title;
        printTotal.innerHTML = totalData;
        printMember.innerHTML = memberHtml;
        printMemory.innerHTML = remaingMemory;
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 워크스페이스 수정 모달열기
async function openEditWorkspaceModal() {
  try {
    const response = await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });
    const workspace = response;
    const editModal = document.querySelector('#modal-basic');

    const titleInput = editModal.querySelector('#edit-title');
    const descriptionInput = editModal.querySelector('#edit-description');

    titleInput.value = workspace.name;
    descriptionInput.value = workspace.description;

    $('#modal-basic').modal('show');
  } catch (err) {
    console.error(err);
  }
}

// 워크스페이스 수정
async function updateWorkspace() {
  const editModal = document.querySelector('#modal-basic');
  const titleInput = editModal.querySelector('#edit-title');
  const descriptionInput = editModal.querySelector('#edit-description');
  const typeInput = editModal.querySelector('#select-search');

  const updatedTitle = titleInput.value;
  const updatedDescription = descriptionInput.value;
  const updatedType = typeInput.value;

  try {
    await $.ajax({
      method: 'PATCH',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name: updatedTitle, type: updatedType, description: updatedDescription }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'success!',
          text: '워크스페이스 수정 완료',
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

// 워크스페이스 삭제
async function deleteWorkspace() {
  try {
    if (confirm('정말로 워크스페이스를 삭제하시겠습니까?')) {
      await $.ajax({
        method: 'DELETE',
        url: `/workspaces/${workspaceId}`,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
        },
        success: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: '워크스페이스 삭제 완료',
          }).then(() => {
            window.location.reload();
          });
        },
      });
    } else {
      return;
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'error',
      text: err.responseJSON.messagee,
    });
  }
}

// 워크스페이스 멤버초대 모달열기
async function openInviteWorkspaceModal() {
  const inviteModal = document.querySelector('#modal-basic2');
  $(inviteModal).modal('show');
}

// 워크스페이스 멤버초대
async function inviteMember() {
  const inviteModal = document.querySelector('#modal-basic2');
  const emailInput = inviteModal.querySelector('#email-input').value;
  const roleInput = inviteModal.querySelector('#select-search').value;
  try {
    await $.ajax({
      method: 'POST',
      url: `/workspaces/${workspaceId}/members`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ email: emailInput, role: roleInput }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: '멤버 초대 완료!',
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

// 워크스페이스 멤버역할 수정 모달열기
async function openEditMemberModal(element) {
  const editMemberModal = document.querySelector('#modal-basic3');

  const userId = element.getAttribute('data-rid-id');
  const editMemberBtn = document.querySelector('#edit-member-btn');

  editMemberBtn.setAttribute('data-rid-id', userId);
  $(editMemberModal).modal('show');
}

// 멤버 역할 변경
async function setMemberRole() {
  const editMemberBtn = document.querySelector('#edit-member-btn');
  const userId = editMemberBtn.getAttribute('data-rid-id');
  const editMemberModal = document.querySelector('#modal-basic3');
  const roleInput = editMemberModal.querySelector('#select-search').value;

  try {
    await $.ajax({
      method: 'PATCH',
      url: `/workspaces/${workspaceId}/${userId}/role`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ role: roleInput }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: '역할 변경 완료!',
        }).then(() => {
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

// 워크스페이스 멤버 삭제
function deleteMember(element) {
  const userId = element.getAttribute('data-rid-id');
  try {
    if (confirm('정말로 해당 멤버를 제외하시겠습니까?')) {
      $.ajax({
        method: 'DELETE',
        url: `/workspaces/${workspaceId}/member/${userId}`,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
        },
        success: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: '멤버 삭제 완료!',
          }).then(() => {
            window.location.reload();
          });
        },
      });
    } else {
      return;
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'error',
      text: err.responseJSON.message,
    });
  }
}

// 워크스페이스가 보유중인 전체 보드 개수
function countWorkspaceBoards(workspaceId) {
  try {
    const response = $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}/boards/count`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    return response;
  } catch (err) {
    console.error(err);
  }
}

// 워크스페이스가 보유중인 전체 카드 개수
async function countWorkspaceCards(workspaceId) {
  try {
    const response = await $.ajax({
      method: 'GET',
      url: `/board-columns/cards/count?workspaceId=${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    return response.totalCount;
  } catch (err) {
    console.error(err);
  }
}
