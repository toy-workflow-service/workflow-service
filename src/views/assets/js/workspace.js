const params = new URLSearchParams(window.location.search);
let workspaceId = params.get('workspaceId');
let selectedMembers = [];
let selectedMemberId = [];

let typingTimer;
const doneTypingInterval = 5000;

$(document).ready(async () => {
  await getMyBoards();
  initializeMemberInput('#name47', '#selected-members', '#create-selected-members');
  // initializeMemberInput('#name48', '#edit-selected-members', '#update-selected-members');
});

function initializeMemberInput(inputSelector, memberListSelector, selected) {
  const memberInput = document.querySelector(inputSelector);
  const selectedMemberList = document.querySelector(memberListSelector);

  updateSelectedMembersUI(selected);
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
          if (!selectedMemberId.includes(results.user.id)) {
            selectedMembers.push({ name: results.user.name, id: results.user.id });
            selectedMemberId.push(results.user.id);
            updateSelectedMembersUI(selected);
          }
        });
      }
    });
  });
}
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
        document.querySelector('#running-boards').innerHTML = `${boards.length} Running Boards`;
        for (const board of boards) {
          // 이부분에서 해당 보드 내의 column을 조회 -> 그 조회한 컬럼안에서 또card조회 해서 return.
          const cardLength = await detailBoardGet(board.boardId);
          result += `<div class="col-xl-4 mb-25 col-md-6">
                      <div class="user-group radius-xl media-ui media-ui--early pt-30 pb-25">
                        <div class="border-bottom px-30">
                          <div class="media user-group-media d-flex justify-content-between">
                            <div class="media-body d-flex align-items-center flex-wrap text-capitalize my-sm-0 my-n2">
                              <a href="/board?boardId=${board.boardId}">
                                <h6 class="mt-0 fw-500 user-group media-ui__title bg-transparent">${
                                  board.boardName
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
                                  <a class="dropdown-item" boardId="${
                                    board.boardId
                                  }" onclick="openEditBoardModal(this)">edit</a>
                                  <a class="dropdown-item" boardId="${
                                    board.boardId
                                  }" onclick="deleteBoard(this)">delete</a>
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
                                  style="width: ${(cardLength.done / cardLength.cards) * 100}%"
                                  aria-valuenow="83"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span class="progress-percentage">${
                                Math.round((cardLength.done / cardLength.cards) * 100) || 0
                              }%</span>
                            </div>
                            <p class="color-light fs-12 mb-20">${cardLength.done} / ${
                              cardLength.cards
                            } tasks completed</p>
                          </div>
                        </div>
                        <div class="mt-20 px-30">
                          <p class="fs-13 color-light mb-10">참여 멤버</p>
                          <ul class="d-flex flex-wrap user-group-people__parent">`;
          for (const member of board.boardMembers) {
            let Img = '';
            member.profile_url ? (Img = `${member.profile_url}`) : (Img = `/assets/img/favicon.png`);
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
        console.log(data);
        const boardId = data.newBoard.identifiers[0].id;

        for (const member of selectedMembers) {
          await createBoardMember(boardId, member.name);
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
function updateSelectedMembersUI(memberListSelector) {
  const selectedMemberList = document.querySelector(memberListSelector);
  selectedMemberList.innerHTML = '';
  selectedMemberList.innerHTML += selectedMembers
    .map(
      (member) => `
    <li id="members" data-member="${member.name}" data-id="${member.id}">${member.name} <span class="remove-member" data-member="${member.id}">x</span></li>
  `
    )
    .join('');

  // 재선택 시 삭제
  const removeIcons = selectedMemberList.querySelectorAll('.remove-member');
  removeIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      const memberRemove = e.target.getAttribute('data-member');
      console.log(memberRemove, 'id값이 들어와야해');
      selectedMembers = selectedMembers.filter((member) => member.id != memberRemove);
      selectedMemberId = selectedMemberId.filter((selected) => selected != memberRemove);
      updateSelectedMembersUI(memberListSelector);
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

    const { boardMembers } = await getBoardMembers(boardId);
    selectedMemberId = [];
    selectedMembers = [];
    for (let data of boardMembers) {
      selectedMemberId.push(data.userId);
      selectedMembers.push({ name: data.name, id: data.userId });
    }
    console.log(selectedMembers);
    initializeMemberInput('#name48', '#edit-selected-members', '#update-selected-members');

    document.getElementById('edit-board-btn').addEventListener('click', async (event) => {
      event.preventDefault();
      const editMembers = [];
      const members = document.querySelectorAll('#members');
      members.forEach((icon) => {
        editMembers.push(icon.getAttribute('data-id'));
      });
      await putBoard(boardId, titleInput.value, descriptionInput.value);
      await putBoardMember(boardId, selectedMemberId);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: '보드를 수정하였습니다.',
      }).then(() => {
        window.location.reload();
      });
    });
    $(editModal).modal('show');
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

// 보드 수정
async function putBoard(boardId, name, description) {
  await $.ajax({
    type: 'PUT',
    url: `boards/${boardId}?workspaceId=${workspaceId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ name, description }),
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

//보드 멤버 수정
async function putBoardMember(boardId, userIdArray) {
  await $.ajax({
    type: 'PUT',
    url: `/boards/${boardId}/members`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ userIdArray }),
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

//보드 삭제
async function deleteBoard(element) {
  const boardId = element.getAttribute('boardId');
  await $.ajax({
    type: 'DELETE',
    url: `boards/${boardId}?workspaceId=${workspaceId}`,
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
        window.location.reload();
      });
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// 보드 상세 조회
async function detailBoardGet(boardId) {
  const allCard = await $.ajax({
    method: 'GET',
    url: `/board-columns?boardId=${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
  }).then(async (columns) => {
    let cardsLength = 0;
    let doneLength = 0;
    for (let column of columns) {
      const cards = await $.ajax({
        method: 'GET',
        url: `/cards?board_column_Id=${column.columnId}`,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Content-type', 'application/json');
          xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
        },
      });
      cardsLength += cards.length;
      if (column.columnName == 'Done') {
        doneLength = cards.length;
      }
    }
    return { cards: cardsLength, done: doneLength };
  });

  return allCard;
}
