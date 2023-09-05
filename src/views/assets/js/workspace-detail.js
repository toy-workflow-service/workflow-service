const params = new URLSearchParams(window.location.search);
let workspaceId = params.get('workspaceId');

$(document).ready(async () => {
  await getWorkspaceDetail();
  await getAllFiles();
});

const printTitle = document.querySelector('#workspace-title');
const printDetail = document.querySelector('#workspace-card');
const printTotal = document.querySelector('#workspace-total');
const printMember = document.querySelector('#workspace-member');
const printFiles = document.querySelector('#workspace-files');
const printStorage = document.querySelector('#workspace-storage');
let userName;
let callerId;

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
      success: async (results) => {
        const { data } = results;
        userName = results.userName;
        callerId = results.userId;

        let [result, title, totalData, memberHtml] = ['', '', '', '', ''];
        const countBoards = await countWorkspaceBoards(data.id);
        const countCards = await countWorkspaceCards(data.id);

        if (data.memberships && data.memberships.length > 0) {
          const membership = data.memberships[0];
          const endDate = new Date(membership.end_date);
          const currentDate = new Date();
          const remaningDate = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

          title += `<h4 class="text-capitalize fw-500 breadcrumb-title" id="workspace-title">${data.name}</h4>
          <div style="display : inline-flex">
          <img src="./assets/img/svg/surface1.svg" alt="surface1" class="svg" style="padding-right: 3px;"/><p style="padding-top: 15px; font-size: 13px">멤버십 종료까지 <strong>${remaningDate}일</strong> 남았습니다.</p>
          `;
        } else {
          title += `<h4 class="text-capitalize fw-500 breadcrumb-title" id="workspace-title">${data.name}</h4>
          <div style="display : inline-flex">
          <p style="padding-top: 15px; font-size: 13px; margin-right: 5px;"><strong>멤버십 가입 시 보드생성 / 멤버초대 무제한!</strong></p>
          <button class="breadcrumb-edit btn btn-white border-0 color-primary content-center fs-12 fw-500 radius-md" data-workspace-id="${data.id}" onclick="openPaymentModal(this)" style="padding : 0.25rem 0.5rem">멤버십 결제</button></div>
          `;
        }
        result += `<div class="card border-0 pb-md-50 pb-15" style="max-height:400px; height:400px">
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
        //유저 이름, 사진, 이메일, 휴대폰 번호, 메세지, 전화, 영상통화
        data.workspace_members.forEach(async (member) => {
          let memberRole = '';
          if (member.role === 1) memberRole = 'Admin';
          if (member.role === 2) memberRole = 'Manager';
          if (member.role === 3) memberRole = 'Member';
          if (member.role === 4) memberRole = 'OutSourcing';
          const user = member.user;
          let Img = '';
          user.profile_url ? (Img = `${user.profile_url}`) : (Img = `./assets/img/favicon.png`);
          user.phone_number;
          if (user.phone_number.length === 11) {
            user.phone_number = `${user.phone_number.substring(0, 3)} - ${user.phone_number.substring(
              3,
              7
            )} - ${user.phone_number.substring(7, 11)}`;
          } else {
            user.phone_number = `${user.phone_number.substring(0, 3)} - ${user.phone_number.substring(
              3,
              6
            )} - ${user.phone_number.substring(6, 10)}`;
          }
          let html1;
          if (results.loginUserRole === 1 || results.loginUserRole === 2) {
            html1 = `                <div class="files-area__right">
                                  <div class="dropdown dropleft">
                                    <button
                                      class="btn-link border-0 bg-transparent p-0"
                                      data-bs-toggle="dropdown"
                                      aria-haspopup="true"
                                      aria-expanded="false"
                                    >
                                      <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg"/>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu--dynamic">
                                      <a class="dropdown-item" data-rid-id="${user.id}" onclick="openEditMemberModal(this)">edit</a>
                                      <a class="dropdown-item" data-rid-id="${user.id}" onclick="deleteMember(this)">delete</a>
                                    </div>
                                  </div>
                                </div>`;
          }
          html1 = html1 ? html1 : '';
          if (results.userId === user.id) {
            memberHtml += `
                        <div class="d-flex align-items-center mb-25">
                          <div class="action-btn">
                            <img src="${Img}" class="wh-46 me-15" alt="img" data-bs-toggle="modal" data-bs-target="#new-member${user.id}"/>
                            <!-- Modal -->
                            <div class="modal fade new-member new-member__2" id="new-member${user.id}" role="dialog" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                              <div class="modal-dialog modal-dialog-centered">
                                <div class="modal-content  radius-xl">
                                  <div class="modal-header">
                                    <h5 class="modal-title fw-500" id="staticBackdropLabel" style="font-weight:bold">프로필 정보</h5>
                                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                      <img src="./assets/img/svg/x.svg" alt="x" class="svg">
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    <div class="new-member-modal">
                                      <div class="card position-relative user-member-card">
                                        <div class="card-body text-center p-30">
                                          <div class="ap-img d-flex justify-content-center">
                                            <!-- Profile picture image-->
                                            <img class="ap-img__main rounded-circle mb-20 bg-opacity-primary wh-150" src="${Img}" alt="profile">
                                          </div>
                                          <div class="ap-nameAddress pb-3" >                                                                                     
                                            <h2 class="ap-nameAddress__title" style="font-weight:bold; padding-top:10px">${user.name}</h2>
                                            <div style="display: inline-flex; margin-top:5%">
                                              <div class="c-info-item-icon" style="margin-right: 20px; margin-left:50px; padding-top:10px">
                                                <img src="./assets/img/svg/phone.svg" alt="phone" class="svg" style="padding-bottom:10px" />
                                                <br/>
                                                <p class="c-info-item-text">
                                                ${user.phone_number}
                                                </p>
                                              </div>  
                                              <div class="c-info-item-icon" style="margin-left: 30px; padding-top:10px">
                                                <img src="./assets/img/svg/mail.svg" alt="mail" class="svg"style="padding-bottom:10px" />
                                                <br/>
                                                <p class="c-info-item-text" >
                                                  ${user.email}
                                                </p>
                                              </div>                                     
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Modal -->
                          </div>
                          <div class="d-flex flex-column flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between">
                              <div>
                                <p class="fs-14 fw-600 color-dark mb-0">${memberRole} ${user.name}</p>
                                <span class="mt-1 fs-14 color-light">${user.email}</span>
                              </div>
                              ${html1}
                            </div>
                          </div>
                        </div>`;
          } else {
            memberHtml += `
                        <div class="d-flex align-items-center mb-25">
                          <div class="action-btn">
                            <img src="${Img}" class="wh-46 me-15" alt="img" data-bs-toggle="modal" data-bs-target="#new-member${user.id}"/>
                            <!-- Modal -->
                            <div class="modal fade new-member new-member__2" id="new-member${user.id}" role="dialog" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                              <div class="modal-dialog modal-dialog-centered">
                                <div class="modal-content  radius-xl">
                                  <div class="modal-header">
                                    <h5 class="modal-title fw-500" id="staticBackdropLabel" style="font-weight:bold">프로필 정보</h5>
                                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                      <img src="./assets/img/svg/x.svg" alt="x" class="svg">
                                    </button>
                                  </div>
                                  <div class="modal-body">
                                    <div class="new-member-modal">
                                      <div class="card position-relative user-member-card">
                                        <div class="card-body text-center p-30">
                                          <div class="ap-img d-flex justify-content-center">
                                            <!-- Profile picture image-->
                                            <img class="ap-img__main rounded-circle mb-20 bg-opacity-primary wh-150" src="${Img}" alt="profile">
                                          </div>
                                          <div class="ap-nameAddress pb-3" >                                                                                     
                                            <h2 class="ap-nameAddress__title" style="font-weight:bold; padding-top:10px">${user.name}</h2>
                                            <div style="display: inline-flex; margin-top:5%">
                                              <div class="c-info-item-icon" style="margin-right: 20px; margin-left:50px; padding-top:10px">
                                                <img src="./assets/img/svg/phone.svg" alt="phone" class="svg" style="padding-bottom:10px" />
                                                <br/>
                                                <p class="c-info-item-text">
                                                ${user.phone_number}
                                                </p>
                                              </div>  
                                              <div class="c-info-item-icon" style="margin-left: 30px; padding-top:10px">
                                                <img src="./assets/img/svg/mail.svg" alt="mail" class="svg"style="padding-bottom:10px" />
                                                <br/>
                                                <p class="c-info-item-text" >
                                                  ${user.email}
                                                </p>
                                              </div>                                     
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="ap-img d-flex justify-content-center" style="display: inline-flex; margin-top:4%">
                                      <button class="btn btn-primary btn-default btn-squared text-capitalize">메시지 전송</button>
                                      <button class="btn btn-primary btn-default btn-squared text-capitalize" style="margin-left:20px" id=${user.id} name=${user.name} onclick="startVoiceCall(this)">음성 통화</button>
                                      <button class="btn btn-primary btn-default btn-squared text-capitalize" style="margin-left:20px" id=${user.id} name=${user.name} onclick="startVideoCall(this)">영상 통화</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Modal -->
                          </div>
                          <div class="d-flex flex-column flex-grow-1">
                            <div class="d-flex align-items-center justify-content-between">
                              <div>
                                <p class="fs-14 fw-600 color-dark mb-0">${memberRole} ${user.name}</p>
                                <span class="mt-1 fs-14 color-light">${user.email}</span>
                              </div>
                              ${html1}
                            </div>
                          </div>
                        </div>`;
          }
        });
        printDetail.innerHTML = result;
        printTitle.innerHTML = title;
        printTotal.innerHTML = totalData;
        printMember.innerHTML = memberHtml;
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 멤버십 결제 모달열기
function openPaymentModal(element) {
  const workspaceId = element.getAttribute('data-workspace-id');
  let paymentModal = document.querySelector('#modal-basic5');

  paymentModal.innerHTML = `
  <form>
  <div class="modal-dialog modal-md" role="document">
    <div class="modal-content modal-bg-white">
      <div class="modal-header">
        <h6 class="modal-title">멤버십 결제</h6>
        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
          <img src="./assets/img/svg/x.svg" alt="x" class="svg" />
        </button>
      </div>
      <div class="modal-body">
        <p><strong>멤버십 타입:</strong> <span id="membership-type">Premium</span></p>
        <p><strong>결제금액:</strong> <span id="membership-price"></span><span>원</span></p>
        <div class="dropdown dropdown-hover">
        <a style="cursor:pointer;">
        <span><strong>이용기간</strong> : <span id="period-select-text">선택</span></span>
          <img src="./assets/img/svg/chevron-down.svg" alt="chevron-down" class="svg" />
        </a>
        <div class="dropdown-default dropdown-clickEvent">
        <p class="dropdown-item" style="cursor:pointer;"><span id="service-period" style="cursor:pointer;">30</span><span>일</span></p>
        <p class="dropdown-item" style="cursor:pointer;"><span id="service-period" style="cursor:pointer;">180</span><span>일</span></p>
        </div>
       </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary btn-sm" data-workspace-id="${workspaceId} "id="payment-btn">결제</button>
        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">취소</button>
      </div>
    </div>
  </div>
  </form>
  `;

  let membershipItems = document.querySelectorAll('.dropdown-default .dropdown-item');
  membershipItems.forEach((item) => {
    item.addEventListener('click', () => {
      let selected = item.textContent;
      document.querySelector('#period-select-text').textContent = selected;
      const membershipPrice = document.querySelector('#membership-price');

      switch (selected) {
        case '30일':
          membershipPrice.textContent = '6,500';
          break;
        case '180일':
          membershipPrice.textContent = '31,000';
          break;
      }
    });
  });
  const paymentBtn = document.querySelector('#payment-btn');
  paymentBtn.addEventListener('click', () => {
    purchaseMembership();
  });

  $(paymentModal).modal('show');
}

// 멤버십 결제
async function purchaseMembership() {
  try {
    let membershipType = document.querySelector('#membership-type').textContent;
    if (membershipType === 'Premium') membershipType = 1;
    const membershipPrice = document.querySelector('#membership-price').textContent.replace(',', '') / 1;
    const selectedPeriod = document.querySelector('#period-select-text').textContent;
    const servicePeriod = parseInt(selectedPeriod.match(/\d+/)[0], 10);
    const workspaceId = document.querySelector('#payment-btn').getAttribute('data-workspace-id');

    await $.ajax({
      method: 'POST',
      url: `/workspaces/${workspaceId}/payments`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ packageType: membershipType, packagePrice: membershipPrice, servicePeriod }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'success!',
          text: '멤버십 결제 완료!',
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        });
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 멤버십 결제 모달열기
function openPaymentModal(element) {
  const workspaceId = element.getAttribute('data-workspace-id');
  let paymentModal = document.querySelector('#modal-basic5');

  paymentModal.innerHTML = `
  <form>
  <div class="modal-dialog modal-md" role="document">
    <div class="modal-content modal-bg-white">
      <div class="modal-header">
        <h6 class="modal-title">멤버십 결제</h6>
        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
          <img src="./assets/img/svg/x.svg" alt="x" class="svg" />
        </button>
      </div>
      <div class="modal-body">
        <p><strong>멤버십 타입:</strong> <span id="membership-type">Premium</span></p>
        <p><strong>결제금액:</strong> <span id="membership-price"></span><span>원</span></p>
        <div class="dropdown dropdown-hover">
        <a style="cursor:pointer;">
        <span><strong>이용기간</strong> : <span id="period-select-text">선택</span></span>
          <img src="./assets/img/svg/chevron-down.svg" alt="chevron-down" class="svg" />
        </a>
        <div class="dropdown-default dropdown-clickEvent">
        <p class="dropdown-item" style="cursor:pointer;"><span id="service-period" style="cursor:pointer;">30</span><span>일</span></p>
        <p class="dropdown-item" style="cursor:pointer;"><span id="service-period" style="cursor:pointer;">180</span><span>일</span></p>
        </div>
       </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary btn-sm" data-workspace-id="${workspaceId} "id="payment-btn">결제</button>
        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">취소</button>
      </div>
    </div>
  </div>
  </form>
  `;

  let membershipItems = document.querySelectorAll('.dropdown-default .dropdown-item');
  membershipItems.forEach((item) => {
    item.addEventListener('click', () => {
      let selected = item.textContent;
      document.querySelector('#period-select-text').textContent = selected;
      const membershipPrice = document.querySelector('#membership-price');

      switch (selected) {
        case '30일':
          membershipPrice.textContent = '6,500';
          break;
        case '180일':
          membershipPrice.textContent = '31,000';
          break;
      }
    });
  });
  const paymentBtn = document.querySelector('#payment-btn');
  paymentBtn.addEventListener('click', () => {
    purchaseMembership();
  });

  $(paymentModal).modal('show');
}

// 멤버십 결제
async function purchaseMembership() {
  try {
    let membershipType = document.querySelector('#membership-type').textContent;
    if (membershipType === 'Premium') membershipType = 1;
    const membershipPrice = document.querySelector('#membership-price').textContent.replace(',', '') / 1;
    const selectedPeriod = document.querySelector('#period-select-text').textContent;
    const servicePeriod = parseInt(selectedPeriod.match(/\d+/)[0], 10);
    const workspaceId = document.querySelector('#payment-btn').getAttribute('data-workspace-id');

    await $.ajax({
      method: 'POST',
      url: `/workspaces/${workspaceId}/payments`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ packageType: membershipType, packagePrice: membershipPrice, servicePeriod }),
      success: () => {
        Swal.fire({
          icon: 'success',
          title: 'success!',
          text: '멤버십 결제 완료!',
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        });
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
    const workspace = response.data;
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
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        });
      },
    });
  } catch (err) {
    console.error(err);
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
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'error',
            text: err.responseJSON.message,
          });
        },
      });
    } else {
      return;
    }
  } catch (err) {
    console.error(err);
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

  const sendingMessage = document.querySelector('#sending-message');
  sendingMessage.style.display = 'block';

  try {
    await $.ajax({
      method: 'POST',
      url: `/workspaces/${workspaceId}/members`,
      data: JSON.stringify({ email: emailInput, role: roleInput }),
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: () => {
        sendingMessage.style.display = 'none';
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: '멤버 초대 완료!',
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        sendingMessage.style.display = 'none';
        Swal.fire({
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        });
      },
    });
  } catch (err) {
    console.error(err);
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
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        });
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// function deleteConfirmModal(element) {
//   const userId = element.getAttribute('data-rid-id')
//   const confirmModal = document.querySelector('#modal-info-confirmed')
//   modal.classList.add("show")

//   const okBtn = modal.querySelector(".btn-info")
//   const cancelBtn = modal.querySelector(".btn-light")

//   okbtn.addE
// }

// <div class="modal-info-confirmed modal fade show" id="modal-info-confirmed" tabindex="-1" role="dialog" aria-hidden="true">

// <div class="modal-dialog modal-sm modal-info" role="document">
//    <div class="modal-content">
//       <div class="modal-body">
//          <div class="modal-info-body d-flex">
//             <div class="modal-info-icon warning">
//                <img src="img/svg/alert-circle.svg" alt="alert-circle" class="svg">
//             </div>

//             <div class="modal-info-text">
//                <h6>Do you Want to delete these items?</h6>
//                <p>Some descriptions</p>
//             </div>

//          </div>
//       </div>
//       <div class="modal-footer">

//          <button type="button" class="btn btn-light btn-outlined btn-sm" data-bs-dismiss="modal">Cancel</button>
//          <button type="button" class="btn btn-info btn-sm" data-bs-dismiss="modal">Ok</button>

//       </div>
//    </div>
// </div>

// </div>

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
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'error',
            text: err.responseJSON.message,
          });
        },
      });
    } else {
      return;
    }
  } catch (err) {
    console.error(err);
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

// 전체파일 조회
async function getAllFiles() {
  try {
    await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}/getFiles`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: async (data) => {
        let result = '';
        data.forEach((file) => {
          const fileOriginalName = file.cards_file_original_name;
          const fileUrl = file.cards_file_url;
          const fileSize = file.cards_file_size;
          let fileNames = [];
          let fileSizes = [];
          let fileUrls = [];

          if (typeof fileOriginalName === 'string') {
            try {
              fileNames = JSON.parse(fileOriginalName);
            } catch (err) {
              fileNames = [fileOriginalName];
            }
          } else {
            fileNames = fileOriginalName;
          }

          if (typeof fileSize === 'string') {
            try {
              fileSizes = JSON.parse(fileSize);
            } catch (err) {
              fileSizes = [parseInt(fileSize)];
            }
          } else {
            fileSizes = [fileSize];
          }

          if (typeof fileUrl === 'string') {
            try {
              fileUrls = JSON.parse(fileUrl);
            } catch (err) {
              fileUrls = [fileUrl];
            }
          } else {
            fileUrls = fileUrl;
          }

          if (Array.isArray(fileNames) && fileNames.length > 0) {
            for (let i = 0; i < fileNames.length; i++) {
              const fileName = fileNames[i];
              const fileUrl = fileUrls[i];
              const imgSrc = getImgSource(fileName);
              const fileSize = getFileSize(fileSizes[i]);

              result += printFilesHtml(fileName, imgSrc, fileSize, fileUrl);
            }
          } else if (typeof fileOriginalName === 'string') {
            const fileName = fileOriginalName.replace(/"/g, '');
            const fileSize = getFileSize(fileSizes);
            const fileUrl = fileUrls;
            const imgSrc = getImgSource(fileName);

            result += printFilesHtml(fileName, imgSrc, fileSize, fileUrl);
          }
        });

        const totalSize = getTotalFileSize(data);
        console.log(totalSize);
        const storage = await printStorageSize(totalSize);

        printStorage.innerHTML = storage;
        printFiles.innerHTML = result;
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 파일의 확장자 분류
function getImgSource(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const fileExtension = extension.replace(/"/g, '');
  let imgSrc = '';

  switch (fileExtension) {
    case 'jpg':
    case 'jpeg':
      imgSrc = './assets/img/jpg@2x.png';
      break;
    case 'png':
      imgSrc = './assets/img/png@2x.png';
      break;
    case 'zip':
      imgSrc = './assets/img/zip@2x.png';
      break;
    case 'pdf':
      imgSrc = './assets/img/pdf@2x.png';
      break;
    case 'psd':
      imgSrc = './assets/img/psd@2x.png';
      break;
    default:
      imgSrc = './assets/img/document.png';
      break;
  }
  return imgSrc;
}

// 파일 메가바이트로 변환
function getFileSize(fileSize) {
  const fileSizeInMb = fileSize / (1024 * 1024);
  return fileSizeInMb.toFixed(2);
}

// 파일 전체용량 계산
function getTotalFileSize(files) {
  let totalSize = 0;
  for (const file of files) {
    const fileSize = file.cards_file_size;

    if (typeof fileSize === 'string') {
      const sizes = JSON.parse(fileSize);
      if (Array.isArray(sizes)) {
        for (const size of sizes) {
          totalSize += parseInt(size, 10) || 0;
        }
      } else {
        totalSize += parseInt(sizes, 10) || 0;
      }
    } else if (typeof fileSize === 'number') {
      totalSize += fileSize;
    }
  }

  const totalSizeInMb = totalSize / (1024 * 1024);

  return totalSizeInMb.toFixed(2);
}

async function printStorageSize(totalSize) {
  try {
    const results = await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    const { data } = results;
    const totalSizeInGb = (totalSize / 1024).toFixed(2);
    const usagePercentageGb = ((totalSizeInGb / 10) * 100).toFixed(0);
    const usagePercentageMb = ((totalSize / 100) * 100).toFixed(0);

    if (data.memberships.length) {
      return `<div class="user-group-progress-bar">
                    <p>워크스페이스 사용량</p>
                    <div class="progress-wrap d-flex align-items-center mb-0">
                      <div class="progress">
                        <div
                          class="progress-bar bg-success"
                          role="progressbar"
                          style="width: ${usagePercentageGb}%"
                          aria-valuenow="${usagePercentageGb}"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <span class="progress-percentage">${usagePercentageGb}%</span>
                    </div>
                    <span class="">10GB 중 ${totalSizeInGb}GB 사용</span>
                  </div>`;
    } else {
      return `<div class="user-group-progress-bar">
                    <p>워크스페이스 사용량</p>
                    <div class="progress-wrap d-flex align-items-center mb-0">
                      <div class="progress">
                        <div
                          class="progress-bar bg-success"
                          role="progressbar"
                          style="width: ${usagePercentageMb}&"
                          aria-valuenow="${usagePercentageMb}"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <span class="progress-percentage">${usagePercentageMb}%</span>
                    </div>
                    <span class="">100MB 중 ${totalSize}MB 사용</span>
                  </div>`;
    }
  } catch (err) {
    console.error(err);
  }
}

// 파일 출력 html
function printFilesHtml(fileName, imgSrc, fileSize, fileUrl) {
  return `<div class="mb-20">
            <div class="files-area d-flex justify-content-between align-items-center">
              <div class="files-area__left d-flex align-items-center">
                <div class="files-area__img">
                  <img src="${imgSrc}" alt="img" class="wh-42" />
                </div>
                <div class="files-area__title">
                  <p class="mb-0 fs-14 fw-500 color-dark text-capitalize">${fileName}</p>
                  <span class="color-light fs-12 d-flex">${fileSize}MB</span>
                  <div class="d-flex text-capitalize">
                    <a href="${fileUrl}" target="_blank" class="fs-12 fw-500 color-primary" style="cursor: pointer">download</a>
                    <a class="fs-12 fw-500 color-primary ms-10"></a>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}

// 음성 통화 시작
function startVoiceCall(element) {
  const receiverId = element.getAttribute('id');
  const receiverName = element.getAttribute('name');
  console.log('Starting voice call...');
  voiceCall(`/call?callerName=${userName}&receiverName=${receiverName}`, '음성 통화', receiverId, receiverName);
}

async function voiceCall(url, callType, receiverId, receiverName) {
  const width = 800;
  const height = 900;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  window.open(url, callType, `width=${width},height=${height},left=${left},top=${top}`);
  socket.emit('invite', { callerName: userName, callerId, receiverId, receiverName });
}

function startVideoCall(element) {
  const receiverId = element.getAttribute('id');
  const receiverName = element.getAttribute('name');
  console.log('Starting video call...');
  videoCall(`/call?callerName=${userName}&receiverName=${receiverName}`, '영상 통화', receiverId, receiverName);
}

async function videoCall(url, callType, receiverId, receiverName) {
  const width = 800;
  const height = 900;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  window.open(url, callType, `width=${width},height=${height},left=${left},top=${top}`);
  socket.emit('invite', { callerName: userName, callerId, receiverId, receiverName });
}
