const params = new URLSearchParams(window.location.search);
let workspaceId = params.get('workspaceId');
let selectedMembers = [];
let selectedMemberId = [];

let typingTimer, workspaceName;
const doneTypingInterval = 5000;

$(document).ready(async () => {
  await getMyBoards('all');
  equalHeight($('.board-description'));
  initializeMemberInput('#name47', '#selected-members', '#create-selected-members');
});

function equalHeight(group) {
  tallest = 0;
  group.each(function () {
    thisHeight = $(this).height();
    if (thisHeight > tallest) {
      tallest = thisHeight;
    }
  });
  group.height(tallest);
}

function initializeMemberInput(inputSelector, memberListSelector, selected) {
  const memberInput = document.querySelector(inputSelector);
  const selectedMemberList = document.querySelector(memberListSelector);

  updateSelectedMembersUI(selected);
  memberInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
      const searchText = e.target.value;
      const encodedSearchText = encodeURIComponent(searchText);

      const results = await searchMembers(encodedSearchText);
      selectedMemberList.innerHTML = '';
      for (let result of results) {
        let Img = result.user.profile_url ? result.user.profile_url : '/assets/img/favicon.png';
        let data = `<li>
                        <a href="#">
                          <img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}" alt="${result.user.name}">
                        </a>
                        <span>${result.user.name}</span>
                      </li>`;
        const li = document.createElement('li');
        li.innerHTML = data;
        selectedMemberList.appendChild(li);

        li.addEventListener('click', () => {
          if (!selectedMemberId.includes(result.user.id)) {
            selectedMembers.push({ name: result.user.name, id: result.user.id });
            selectedMemberId.push(result.user.id);
            updateSelectedMembersUI(selected);
          }
        });
      }
    });
  });
}
const printBoard = document.querySelector('#board-box');
const printListBoard = document.querySelector('#board-list-box');
const printButton = document.querySelector('.nav-item');
function changeSelect() {
  let selected = document.querySelector('#event-category');
  if (selected.value == 'all') {
    getMyBoards(selected.value, '');
  } else if (selected.value == 'ing') {
    getMyBoards(selected.value, '');
  } else {
    getMyBoards(selected.value, '');
  }
}
// 보드 전체 조회
async function getMyBoards(selectItem, search) {
  await $.ajax({
    method: 'GET',
    url: `/boards?workspaceId=${workspaceId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      const boards = data.boards;
      workspaceName = data.workspaceName;
      let result = '';
      let button = '';
      let listResult = '';
      document.querySelector('#workspace-title').innerHTML = `${workspaceName}`;
      document.querySelector('#running-boards').innerHTML = `전체 보드 개수 : ${boards.length}`;
      for (const board of boards) {
        if (selectItem == 'all' && !search) {
          result += boardHTML(board);
          listResult += boardListHTML(board);
        } else if (selectItem == 'ing' && !search) {
          const count = Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0;
          if (count != 100) {
            result += boardHTML(board);
            listResult += boardListHTML(board);
          }
        } else if (selectItem == 'end' && !search) {
          const count = Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0;
          if (count == 100) {
            result += boardHTML(board);
            listResult += boardListHTML(board);
          }
        } else {
          if (board.boardName.search(search) > -1) {
            result += boardHTML(board);
            listResult += boardListHTML(board);
          } else {
            for (const member of board.boardMembers) {
              if (member.name.search(search) > -1) {
                result += boardHTML(board);
                listResult += boardListHTML(board);
              }
            }
          }
        }
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
      printListBoard.innerHTML = listResult;
      printBoard.innerHTML = result;
      printButton.innerHTML = button;
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'Error',
        text: error.responseJSON.message,
      }).then(() => {
        window.location.href = '/';
      });
    },
  });
}

// 보드 html
function boardHTML(board) {
  let check = '';
  let result = '';
  const count = Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0;
  if (count == 100) {
    check = `<span class="my-sm-0 my-2 media-badge text-uppercase color-white bg-primary">완료</span>`;
  } else {
    check = `<span class="my-sm-0 my-2 media-badge text-uppercase color-white " style="background-color: green;">진행중</span>`;
  }
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  let sendTime = new Date(new Date(board.deadline).getTime() - offset).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  let startSendTime = new Date(new Date(board.startDate).getTime() - offset).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  // 이부분에서 해당 보드 내의 column을 조회 -> 그 조회한 컬럼안에서 또card조회 해서 return.
  result += `<div class="col-xl-4 mb-25 col-md-6">
                      <div class="user-group radius-xl media-ui media-ui--early pt-30 pb-25">
                        <div class="border-bottom px-30">
                          <div class="media user-group-media d-flex justify-content-between">
                            <div class="media-body d-flex align-items-center flex-wrap text-capitalize my-sm-0 my-n2">
                              <a href="/board?boardId=${board.boardId}" style="width: fit-content;">
                                <h6 class="mt-0 fw-500 user-group media-ui__title bg-transparent">${
                                  board.boardName
                                }</h6>
                              </a>
                              ${check}
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
                                  }" checkCards="${count}" onclick="openEditBoardModal(this)">수정</a>
                                  <a class="dropdown-item" boardId="${board.boardId}" onclick="deleteConfirmModal(${
                                    board.boardId
                                  }, 'board')">삭제</a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="user-group-people mt-15 text-capitalize">
                            <div class="board-description"><p>${board.description}</p></div>
                            <div class="user-group-project">
                              <div class="d-flex align-items-center user-group-progress-top">
                                <div class="media-ui__start">
                                  <span class="color-light fs-12">시작일</span>
                                  <p class="fs-14 fw-500 color-dark mb-0">${
                                    board.startDate
                                      ? '20' + startSendTime.substring(0, 10).replace('-', '.').replace('-', '.')
                                      : '____.__.__'
                                  }</p>
                                </div>
                                <div class="media-ui__start">
                                  <span class="color-light fs-12">마감일</span>
                                  <p class="fs-14 fw-500 color-dark mb-0">${
                                    board.deadline
                                      ? '20' + sendTime.substring(0, 10).replace('-', '.').replace('-', '.')
                                      : '____.__.__'
                                  }</p>
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
                                  style="width: ${(board.cardCount.done / board.cardCount.total) * 100}%"
                                  aria-valuenow="83"
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span class="progress-percentage">${
                                Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0
                              }%</span>
                            </div>
                            <p class="color-light fs-12 mb-20">${board.cardCount.done} / ${
                              board.cardCount.total
                            } 카드</p>
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
  return result;
}

function boardListHTML(board) {
  let check = '';
  let result = '';
  const count = Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0;
  if (count == 100) {
    check = `<span class="my-sm-0 my-2 media-badge text-uppercase color-white bg-primary">완료</span>`;
  } else {
    check = `<span class="my-sm-0 my-2 media-badge text-uppercase color-white " style="background-color: green;">진행중</span>`;
  }
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  let sendTime = new Date(new Date(board.deadline).getTime() - offset).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  let startSendTime = new Date(new Date(board.startDate).getTime() - offset).toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  // 이부분에서 해당 보드 내의 column을 조회 -> 그 조회한 컬럼안에서 또card조회 해서 return.
  result += `<tr>
              <td>
                <div class="contact-item d-flex align-items-center">
                    <div class="contact-personal-info d-flex">
                      <div class="contact_title">
                          <h6>
                            <a href="/board?boardId=${board.boardId}">${board.boardName}</a>
                          </h6>
                      </div>
                    </div>

                </div>
              </td>
              <td>
                ${check}
              </td>
              <td>
                <span class="board-startline">${
                  board.startDate
                    ? '20' + startSendTime.substring(0, 10).replace('-', '.').replace('-', '.')
                    : '____.__.__'
                }</span>
              </td>
              <td>
                <span class="board-deadline">${
                  board.deadline ? '20' + sendTime.substring(0, 10).replace('-', '.').replace('-', '.') : '____.__.__'
                }</span>
              </td>
              <td>
                <span class="board-cardCount">${
                  Math.round((board.cardCount.done / board.cardCount.total) * 100) || 0
                }%</span>
              </td>
              <td>
                <div class="table-actions">
                    <span class="board-memberCount" style="margin-right: 50%;">${board.boardMembers.length}</span>
                    <div class="dropdown dropdown-click">
                      <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <img class="svg" src="./assets/img/svg/more-vertical.svg" alt="more-vertical">
                      </button>
                      <div class="dropdown-default dropdown-menu dropdown-menu--dynamic">
                          <a class="dropdown-item" boardId="${
                            board.boardId
                          }" checkCards="${count}" onclick="openEditBoardModal(this)">수정</a>
                          <a class="dropdown-item" boardId="${board.boardId}" onclick="deleteConfirmModal(${
                            board.boardId
                          }, 'board')">삭제</a>
                      </div>
                    </div>
                </div>
              </td>
            </tr>`;
  return result;
}

// 보드 생성
const createBoardBtn = document.querySelector('#create-button');
document.querySelector('#create-board-btn').addEventListener('click', () => {
  selectedMemberId = [];
  selectedMembers = [];
  if (Boolean(document.querySelector('#name47').value)) {
    document.querySelector('#name47').value = '';
    document.querySelector('#create-selected-members').innerHTML = '';
    document.querySelector('#selected-members').innerHTML = '';
  }
});

createBoardBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const createTitle = document.querySelector('#create-board-title').value;
    const createDescription = document.querySelector('#create-board-desc').value;
    let deadline = document.querySelector('#datepicker').value;
    let startline = document.querySelector('#datepicker4').value;

    deadline = new Date(deadline);
    startline = new Date(startline);

    await $.ajax({
      method: 'POST',
      url: `/boards?workspaceId=${workspaceId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ name: createTitle, description: createDescription, deadline, start_date: startline }),
      success: async (data) => {
        const boardId = data.newBoard.identifiers[0].id;

        for (const member of selectedMembers) {
          await createBoardMember(boardId, member.id);
        }

        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'success',
          title: 'Success!',
          text: data.message,
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        }).then(() => {
          window.location.reload();
        });
      },
    });
  } catch (err) {
    console.error(err);
  }
});

// 보드멤버 생성
async function createBoardMember(boardId, saveUserId) {
  let userId, boardName;
  const date = new Date(Date.now());
  try {
    await $.ajax({
      method: 'POST',
      url: `boards/${boardId}/members`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
      data: JSON.stringify({ userId: saveUserId }),
      success: (data) => {
        userId = data.userId;
        boardName = data.boardName;
      },
      error: (err) => {
        Swal.fire({
          customClass: {
            container: 'my-swal',
          },
          icon: 'error',
          title: 'error',
          text: err.responseJSON.message,
        }).then(() => {
          window.location.reload();
        });
      },
    });
  } catch (err) {
    console.error(err);
  }

  socket.emit('inviteBoard', {
    userId,
    workspaceId,
    boardName,
    date: new Date(new Date(date).getTime()),
  });
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

      selectedMembers = selectedMembers.filter((member) => member.id != memberRemove);
      selectedMemberId = selectedMemberId.filter((selected) => selected != memberRemove);
      updateSelectedMembersUI(memberListSelector);
    });
  });
}

// 보드 수정 모달
async function openEditBoardModal(element) {
  const boardId = element.getAttribute('boardId');
  const count = element.getAttribute('checkCards');
  const checkBoxEnd = document.querySelector('#check-grp-4');
  const checkBoxIng = document.querySelector('#check-grp-3');
  document.querySelector('#name48').value = '';
  document.querySelector('#edit-selected-members').innerHTML = '';
  if (count == 100) {
    checkBoxEnd.checked = true;
    checkBoxIng.checked = false;
  } else {
    checkBoxEnd.checked = false;
    checkBoxIng.checked = true;
  }
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
    const deadlineInput = document.querySelector('#datepicker2');
    const startlineInput = document.querySelector('#datepicker3');
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    let sendTime = new Date(new Date(board.deadline).getTime() - offset).toLocaleString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    let startSendTime = new Date(new Date(board.start_date).getTime() - offset).toLocaleString('Ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });

    titleInput.value = board.name;
    descriptionInput.value = board.description;
    deadlineInput.value = board.deadline ? '20' + sendTime : '';
    startlineInput.value = board.start_date ? '20' + startSendTime : '';

    const { boardMembers } = await getBoardMembers(boardId);
    selectedMemberId = [];
    selectedMembers = [];
    for (let data of boardMembers) {
      selectedMemberId.push(data.userId);
      selectedMembers.push({ name: data.name, id: data.userId });
    }

    initializeMemberInput('#name48', '#edit-selected-members', '#update-selected-members');

    document.getElementById('edit-board-btn').addEventListener('click', async (event) => {
      event.preventDefault();
      const editMembers = [];
      const members = document.querySelectorAll('#members');
      members.forEach((icon) => {
        editMembers.push(icon.getAttribute('data-id'));
      });
      await putBoard(
        boardId,
        titleInput.value,
        descriptionInput.value,
        new Date(deadlineInput.value),
        new Date(startlineInput.value)
      );
      await putBoardMember(boardId, selectedMemberId);
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
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

// 보드 수정
async function putBoard(boardId, name, description, deadline, startDate) {
  await $.ajax({
    type: 'PUT',
    url: `boards/${boardId}?workspaceId=${workspaceId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ name, description, deadline, start_date: startDate }),
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
  let updateUserList = [];
  let boardName;
  const date = new Date(Date.now());
  await $.ajax({
    type: 'PUT',
    url: `/boards/${boardId}/members`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ userIdArray }),
    success: (data) => {
      if (data.updateUserList) {
        updateUserList = [...data.updateUserList];
      }
      boardName = data.boardName;
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
  if (updateUserList.length) {
    updateUserList.forEach((userId) => {
      socket.emit('inviteBoard', {
        userId,
        workspaceId,
        workspaceName,
        boardName,
        date: new Date(new Date(date).getTime()),
      });
    });
  }
}

// 삭제 확인 모달 출력
function deleteConfirmModal(targetId, targetType) {
  const confirmModal = document.querySelector('#modal-info-confirmed');
  $(confirmModal).modal('show');

  const okBtn = confirmModal.querySelector('.btn-info');
  const cancelBtn = confirmModal.querySelector('.btn-light');

  okBtn.addEventListener('click', () => {
    if (targetType === 'board') {
      deleteBoard(targetId);
    }
    $(confirmModal).modal('hide');
  });

  cancelBtn.addEventListener('click', () => {
    $(confirmModal).modal('hide');
  });
}

//보드 삭제
async function deleteBoard(boardId) {
  await $.ajax({
    type: 'DELETE',
    url: `boards/${boardId}?workspaceId=${workspaceId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'success',
        title: 'Success!',
        text: data.message,
      }).then(() => {
        window.location.reload();
      });
    },
    error: (error) => {
      Swal.fire({
        customClass: {
          container: 'my-swal',
        },
        icon: 'error',
        title: 'error',
        text: error.responseJSON.message,
      });
    },
  });
}

// 헤더에 있는 검색창
let searchInput = '';

// 전체 화면일땐 이부분을 사용하는데
document.querySelector('.search-form-topMenu').addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput = document.querySelector('#header-search').value;
  document.querySelector('.search-form-topMenu').classList.remove('show');
  document.querySelector('.search-toggle').classList.remove('active');
  if (searchInput) {
    document.querySelector('.search-result').innerHTML = `검색 결과: ${searchInput}`;
  } else {
    document.querySelector('.search-result').innerHTML = '';
  }
  document.querySelector('#header-search').value = '';
  getMyBoards('all', searchInput);
});

//화면을 줄이면 이부분을 사용함
document.querySelector('.search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput = document.querySelector('#search-form').value;
  document.querySelector('.mobile-search').classList.remove('show');
  document.querySelector('.btn-search').classList.remove('search-active');
  document.querySelector('#search-form').value = '';
  if (searchInput) {
    document.querySelector('.mobile-search-result').innerHTML = `검색 결과: ${searchInput}`;
  } else {
    document.querySelector('.mobile-search-result').innerHTML = '';
  }
  getMyBoards('all', searchInput);
});

//grid or list button

document.querySelector('#grid-icon').addEventListener('click', (event) => {
  event.preventDefault();
  console.log('확인해보고 있어요.');
  document.querySelector('#grid-icon').classList.add('active');
  document.querySelector('#list-icon').classList.remove('active');
  $('#list-box').hide();
  $('#board-box').show();
});

document.querySelector('#list-icon').addEventListener('click', (event) => {
  event.preventDefault();
  console.log('확인해보고 있어요.');
  document.querySelector('#list-icon').classList.add('active');
  document.querySelector('#grid-icon').classList.remove('active');
  $('#list-box').show();
  $('#board-box').hide();
});
