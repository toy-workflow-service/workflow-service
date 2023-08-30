const params = new URLSearchParams(window.location.search);
let workspaceId = params.get('workspaceId');
let selectedMembers = [];

let typingTimer;
const doneTypingInterval = 5000;

$(document).ready(async () => {
  await getMyBoards();

  const memberInput = document.querySelector('#name47');
  const selectedMemberList = document.querySelector('#selected-members');

  memberInput.addEventListener('keyup', (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
      const searchText = e.target.value;
      const encodedSearchText = encodeURIComponent(searchText);

      const results = await searchMembers(encodedSearchText);
      if (results) {
        selectedMemberList.innerHTML = '';
        let Img = results.user.profile_url ? results.user.profile_url : '/assets/img/favicon.png';
        let data = `<li>
                        <a href="#">
                          <img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}" alt="${results.user.name}">
                        </a>
                        <span>${results.user.name}</span>
                      </li>`;
        const li = document.createElement('li');
        li.innerHTML = data;
        selectedMemberList.appendChild(li);

        li.addEventListener('click', () => {
          if (!selectedMembers.includes(results.user.name)) {
            selectedMembers.push(results.user.name);
            updateSelectedMembersUI();
          }
        });
      }
    });
  });
});

const printBoard = document.querySelector('#board-box');
const printButton = document.querySelector('.nav-item');

// 보드 전체 조회
async function getMyBoards() {
  try {
    await $.ajax({
      method: 'GET',
      url: `/boards?workspaceId=${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      success: async (data) => {
        const boards = data.boards;
        let result = '';
        let button = '';

        for (const board of boards) {
          result += `<div class="col-xl-4 mb-25 col-md-6">
                      <div class="user-group radius-xl media-ui media-ui--early pt-30 pb-25">
                        <div class="border-bottom px-30">
                          <div class="media user-group-media d-flex justify-content-between">
                            <div class="media-body d-flex align-items-center flex-wrap text-capitalize my-sm-0 my-n2">
                              <a href="application-ui.html">
                                <h6 class="mt-0 fw-500 user-group media-ui__title bg-transparent">${board.boardName
            }</h6>
                              </a>
                              <span class="my-sm-0 my-2 media-badge text-uppercase color-white bg-primary">early</span>
                            </div>
                            <div class="mt-n15">
                              <div class="dropdown dropleft">
                                <button
                                  class="btn-link border-0 bg-transparent p-0"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg" />
                                </button>
                                <div class="dropdown-menu">
                                  <a class="dropdown-item" boardId="${board.boardId
            }" onclick="openEditBoardModal(this)">edit</a>
                                  <a class="dropdown-item">delete</a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="user-group-people mt-15 text-capitalize">
                            <p>${board.description}</p>
                            <div class="user-group-project">
                              <div class="d-flex align-items-center user-group-progress-top">
                                <div class="media-ui__start">
                                  <span class="color-light fs-12">시작일</span>
                                  <p class="fs-14 fw-500 color-dark mb-0">${board.createdAt
              .substring(0, 10)
              .replace('-', '.')
              .replace('-', '.')}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="user-group-progress-bar">
                            <div class="progress-wrap d-flex align-items-center mb-0">
                              <div class="progress">
                                <div
                                  class="progress-bar bg-primary"
                                  role="progressbar"
                                  style="width: 83%"
                                  aria-valuenow="83"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span class="progress-percentage">83%</span>
                            </div>
                            <p class="color-light fs-12 mb-20">12 / 15 tasks completed</p>
                          </div>
                        </div>
                        <div class="mt-20 px-30">
                          <p class="fs-13 color-light mb-10">참여 멤버</p>
                          <ul class="d-flex flex-wrap user-group-people__parent">`;
          const data = await getBoardMembers(board.boardId);
          const boardMembers = data.boardMembers;
          for (const member of boardMembers) {
            let Img = '';
            member.profileUrl ? (Img = `${member.profileUrl}`) : (Img = `/assets/img/favicon.png`);
            result += `<li>
                        <a href="#"
                          ><img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}" alt="${member.name}"
                        /></a>
                      </li>`;
          }
          result += `</ul></div>`;
          result += `</div></div></div>`;
        }
        button += `<li class="nav-item">
                    <a
                      class="nav-link active"
                      id="ap-overview-tab"
                      href="/workspaceDetail?workspaceId=${workspaceId}"
                      role="tab"
                      aria-selected="true"
                      >워크스페이스 디테일</a
                    >
                  </li>`;
        printBoard.innerHTML = result;
        printButton.innerHTML = button;
      },
    });
  } catch (err) {
    console.error(err);
  }
}

// 보드 멤버 조회
function getBoardMembers(boardId) {
  try {
    const response = $.ajax({
      method: 'GET',
      url: `/boards/${boardId}/members`,
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

// 보드 생성
const createBoardBtn = document.querySelector('#create-button');

createBoardBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const createTitle = document.querySelector('#create-board-title').value;
    const createDescription = document.querySelector('#create-board-desc').value;
    console.log(createTitle);
    console.log(createDescription);
    await $.ajax({
      method: 'POST',
      url: `/boards?workspaceId=${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name: createTitle, description: createDescription }),
      success: async (data) => {
        const boardId = data.newBoard.identifiers[0].id;

        for (const member of selectedMembers) {
          await createBoardMember(boardId, member);
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: data.message,
        }).then(() => {
          window.location.reload();
        });
      },
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.responseJSON.message,
    });
  }
});

// 보드멤버 생성
async function createBoardMember(boardId, name) {
  try {
    await $.ajax({
      method: 'POST',
      url: `boards/${boardId}/members`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name }),
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.responseJSON.message,
    });
  }
}

// 유저검색
async function searchMembers(searchText) {
  try {
    const response = await $.ajax({
      method: 'GET',
      url: `/workspaces/${workspaceId}/members/search?name=${searchText}`,
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

// 선택한 멤버 UI 출력
function updateSelectedMembersUI() {
  const selectedMemberList = document.querySelector('#selected-members');
  selectedMemberList.innerHTML = selectedMembers
    .map(
      (member) => `
    <li>${member} <span class="remove-member" data-member="${member}">x</span></li>
  `
    )
    .join('');

  // 재선택 시 삭제
  const removeIcons = selectedMemberList.querySelectorAll('.remove-member');
  removeIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      const memberRemove = e.target.getAttribute('data-member');
      selectedMembers = selectedMembers.filter((name) => name !== memberRemove);
      updateSelectedMembersUI();
    });
  });
}

// 보드 수정 모달
async function openEditBoardModal(element) {
  const boardId = element.getAttribute('boardId');
  try {
    const response = await $.ajax({
      method: 'GET',
      url: `/boards/${boardId}?workspaceId=${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    const board = response.board;
    const editModal = document.querySelector('#new-member2');

    const titleInput = editModal.querySelector('input[type="text"]');
    const descriptionInput = editModal.querySelector('textarea');

    titleInput.value = board.name;
    descriptionInput.value = board.description;

    const data = await getBoardMembers(boardId);
    const selectedMembersList = editModal.querySelector('.user-group-people__parent');

    selectedMembersList.innerHTML = '';
    for (const member of data.boardMembers) {
      const memberImage = member.profileUrl ? member.profileUrl : './assets/img/favicon.png';
      selectedMembersList.innerHTML += `
        <li>
          <a>
            <img class="rounded-circle wh-34 bg-opacity-secondary" src="${memberImage}" alt="${member.name}" />
            <span class="remove-member" data-member="${member.name}" data-member-id="${member.userId}">x</span>
          </a>
        </li>`;
    }

    const removeIcons = selectedMembersList.querySelectorAll('.remove-member');
    removeIcons.forEach((icon) => {
      icon.addEventListener('click', (e) => {
        const memberRemove = e.target.getAttribute('data-member');
        selectedMembers = selectedMembers.filter((name) => name !== memberRemove);
        updateSelectedMembersUI();
      });
    });

    $(editModal).modal('show');
  } catch (err) {
    console.error(err);
  }
}

// async function updateBoard(element) {
//   const boardId = element.getAttribute('boardId')
//   const modal =
// }
