var srcElement = null;

function dragStart(e) {
  // Target (this) element is the source node.
  srcElement = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);

  this.classList.add('dragged');
}
function dragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

  return false;
}

function dragEnter(e) {
  // this / e.target is the current hover target.
}

function dragLeave(e) {
  this.classList.remove('over'); // this / e.target is previous target element.
}

function elementDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (srcElement != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //srcElement.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');
    this.parentNode.removeChild(srcElement);
    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin', dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);
  }
  this.classList.remove('over');
  return false;
}

function dragEnd(e) {
  // this/e.target is the source node.
  this.classList.remove('over');
  console.log('dragEnd : ', e);
}

function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', dragStart, false);
  elem.addEventListener('dragenter', dragEnter, false);
  elem.addEventListener('dragover', dragOver, false);
  elem.addEventListener('dragleave', dragLeave, false);
  elem.addEventListener('drop', elementDrop, false);
  elem.addEventListener('dragend', dragEnd, false);
}

var cols = document.querySelectorAll('.drag-drop .draggable');
[].forEach.call(cols, addDnDHandlers);

// -----------------여기서부터 작업함--------------------
let boardId = new URLSearchParams(window.location.search).get('boardId');
// boardId = Number(boardId);
// boardId = 65;

// $(init);
$(BoardColumnsGet);

function init() {
  $('.kanban-items,.todo-task1 tbody')
    .sortable({
      connectWith: '.kanban-items,.todo-task1 tbody',
      stack: '.kanban-items  ul,.todo-task1 tbody',
      start: function (e, i) {
        // console.log('start : ', e, i);
      },
      stop: function (e, i) {
        // console.log('stop : ', e, i);
        CardListReorder();
      },
    })
    .disableSelection();
  $('.kanban-container,.todo-task2 tbody')
    .sortable({
      connectWith: '.kanban-container,.todo-task2 tbody ',
      stack: '.kanban-container,.todo-task2 tbody',
      start: function (e, i) {
        // console.log('start : ', e, i);
      },
      stop: function (e, i) {
        // console.log('stop : ', e, i);
        ColumnListReorder();
      },
    })
    .disableSelection();
}

// 바뀐 순서 출력 (여기서 순서 update api 사용할듯)
function ColumnListReorder() {
  const columns = document.querySelectorAll('.kanban-list');
  Object.values(columns).forEach(async (column, index) => {
    // console.log('testest: ', column, index + 1);
    // console.log('columnId : ', column.getAttribute('data-columnid'));
    const columnId = column.getAttribute('data-columnid');
    if (columnId != 0) {
      //컬럼 순서 저장
      const sequence = Number(index) + 1;
      await BoardColumnSequenceUpdate(columnId, sequence);
    }
  });
  // console.dir($('.kanban-list'));
}

function CardListReorder() {
  const cards = document.querySelectorAll('#card-list-item');
  Object.values(cards).forEach(async (card, index) => {
    const columnId = card.parentElement.getAttribute('data-columnId');
    const cardId = card.getAttribute('data-cardid');
    await CardSequenceUpdate(columnId, cardId, index + 1);
  });
  // console.log($('.list-items').children('li'));
  // console.dir($('.list-items'));
}

// put column sequence API
async function BoardColumnSequenceUpdate(columnId, sequence) {
  $.ajax({
    type: 'PUT',
    url: `/board-columns/${columnId}/sequence?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ sequence }),
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get column API
async function BoardColumnsGet() {
  await $.ajax({
    type: 'GET',
    url: `/board-columns?boardId=${boardId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      BoardColumns(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get board column, card getHtml
// 아직 card api가 없기 때문에 column만 일단 넣음
let cardIndex = 0;
async function BoardColumns(data) {
  document.querySelector(
    '.breadcrumb-main'
  ).innerHTML = `<h4 class="text-capitalize breadcrumb-title">${data[0].boardName}</h4>
                <div class="breadcrumb-action justify-content-center flex-wrap">
                  <nav aria-label="breadcrumb">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/"><i class="uil uil-estate"></i>Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">work-flow Board</li>
                      </ol>
                  </nav>
                </div>`;
  document.querySelector('.kanban-header').innerHTML = `<h4>${data[0].boardName} project</h4>`;

  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = '';
  let i = 0;
  for (i in data) {
    const card = await CardGet(data[i].columnId);
    const cardHtml = card
      .map(
        (c) =>
          `<li class="d-flex justify-content-between align-items-center " style="background-color: ${c.color}" draggable="true" id="card-list-item" data-columnId=${data[i].columnId} data-cardId=${c.id}>
                                        ${c.name}
                                      <button class="open-popup-modal" type="button">
                                        <img src="./assets/img/svg/edit-2.svg" alt="edit-2" class="svg">
                                      </button>
                                      <div class="popup-overlay">
                                        <!--Creates the popup content-->
                                        <div class="popup-content">
                                            <div class="mb-10 popup-textarea">
                                              <textarea class="form-control" rows="3" placeholder="Edit title..."></textarea>
                                            </div>
                                            <div class="d-flex align-items-center popup-button">
                                              <button class="save-title-changes btn btn-primary btn-sm btn-squared rounded" type="submit">Submit</button>
                                            </div>
                                            <div class="overlay-close"></div>
                                        </div>
                                      </div>
                                  </li>`
      )
      .join('');
    cardIndex += Number(card.length);
    if (data[i].columnName == 'Done') {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" draggable="true" data-columnId=${data[i].columnId}>
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title">${data[i].columnName}</h3>
                                    </div>
                                  </div>  
                                  <div id="cardListItems${data[i].columnId}">
                                    <ul class="kanban-items list-items  drag-drop " style="min-height: 50px; max-height: 350px" data-columnId="${data[i].columnId}">
                                    ${cardHtml}
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                                    card</button>
                                  </div>
  
                                </div>`;
    } else {
      kanbanList.innerHTML += `<div class="list kanban-list draggable" draggable="true" data-columnId=${data[i].columnId}>
                                  <div class="kanban-tops list-tops">
                                    <div class="d-flex justify-content-between align-items-center py-10">
                                        <h3 class="list-title">${data[i].columnName}</h3>
                                        <div class="dropdown dropdown-click">
                                          <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                              <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                          </button>
                                          <div class="dropdown-default dropdown-bottomRight dropdown-menu" style="">
                                              <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#updateColumnModal" id="updateColumnTitle" data-value="${data[i].columnId}" data-title="${data[i].columnName}">Edit Column Title</a>
                                              <a class="dropdown-item" id="ColumnDeleteBtn" value="${data[i].columnId}">Delete Column</a>
                                          </div>
                                        </div>
                                    </div>
                                  </div>
  
                                  <div id="cardListItems${data[i].columnId}">
                                    <ul class="kanban-items list-items  drag-drop " style="min-height: 50px; max-height: 350px" data-columnId="${data[i].columnId}">
                                    ${cardHtml}       
                                    </ul>
                                    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${data[i].columnId}" data-index="${cardIndex}"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                                    card</button>
                                  </div>
  
                                </div>`;
    }
    console.log(cardIndex);
  }
  kanbanList.innerHTML += `<div class="kanban-list list draggable" draggable="true" data-columnId=0>
                            <div class="list__add-card">
                              <div class="kanban-board__add-card">
                                  <button class="shadow-none border-0" data-bs-toggle="modal" data-bs-target="#editColumnModal"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg">
                                    Add
                                    column</button>
                              </div>
                            </div>
                          </div>`;

  init();
  // column add button click
  document.getElementById('ColumnAddBtn').addEventListener('click', (a) => {
    // Number(i) + 1 -> sequence
    const columnTitle = document.getElementById('columnTitle').value;
    console.log('BoardColumns in sequence, columTitle : ', a, Number(i) + 1, columnTitle);
    BoardColumnsCreate(columnTitle, Number(i) + 1);
  });

  //column delete button click
  document.querySelectorAll('#ColumnDeleteBtn').forEach((data) => {
    data.addEventListener('click', async (e) => {
      const columnId = e.target.getAttribute('value');
      await BoardColumnDelete(columnId);
    });
  });

  //모달창이 열리면 해당 모달창에 value값으로 columnId값을 보내거나 받아와야함
  let columnId;
  document.querySelectorAll('#updateColumnTitle').forEach((data) => {
    data.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-value');
      const title = e.target.getAttribute('data-title');
      document.getElementById('columnTitleUpdate').value = title;
      columnId = id;
    });
  });

  document.getElementById('ColumnUpdateNameBtn').addEventListener('click', async () => {
    const columnTitle = document.getElementById('columnTitleUpdate').value;
    await BoardColumnNameUpdate(columnId, columnTitle);
  });

  // 카드 생성 멤버 추가 버튼 클릭 시
  document.getElementById('cardCreateAddMemberBtn').addEventListener('click', () => {
    if ($('#cardCreateAddMemberBox').css('display') == 'none') {
      $('#cardCreateAddMemberBox').show();
    } else {
      $('#cardCreateAddMemberBox').hide();
    }
  });

  // card detail box click
  // 모달창이 열리면 해당하는 card 값들을 뿌려주기, member초대란 만들기, 댓글란 만들기
  document.querySelectorAll('#card-list-item').forEach((data) => {
    data.addEventListener('click', (e) => {
      const cardId = e.target.getAttribute('data-cardId');
      columnId = e.target.getAttribute('data-columnId');

      // DetailCardGet(columnId, cardId);
    });
  });

  // 댓글 모달창이 열리면 해당하는 대댓글과 댓글 값 뿌려주기
  document.querySelectorAll('#commentDetail').forEach((data) => {
    data.addEventListener('click', (e) => {
      const cardId = e.target.getAttribute('data-cardId');
      const commentId = e.target.getAttribute('data-commentId');
      columnId = e.target.getAttribute('data-columnId');
    });
  });

  // CardUpdateBtn 버튼 클릭 시
  document.getElementById('CardUpdateBtn').addEventListener('click', async () => {
    // 수정 된값이 db로 넘어가야함.
    console.log('update btn check');
    // await CardAllUpdate(columnId, cardId, data)
  });

  // cardDeleteBtn 클릭 시
  document.getElementById('cardDeleteBtn').addEventListener('click', async () => {
    console.log('delete btn check');
    // await CardDelete(columnId, cardId);
  });

  // 대댓글 작성 버튼
  document.getElementById('replayCommentBtn').addEventListener('click', () => {
    if ($('#commentAddBox').css('display') == 'none') {
      $('#commentAddBox').show();
    } else {
      $('#commentAddBox').hide();
    }
  });
  // card create button click
  //모달 창이 열리면 해당 columnId값을 보내줘야함
  let cardSequence;
  let cardColumnId;
  document.querySelectorAll('#createCard').forEach((data) => {
    data.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-columnId');
      cardColumnId = id;
      const sequence = e.target.getAttribute('data-index');
      cardSequence = Number(sequence) + 1;
      console.log('sequence, columnId', cardSequence, cardColumnId);
    });
  });
  document.getElementById('CardCreateBtn').addEventListener('click', () => {
    const cardTitle = document.getElementById('cardTitleCreate').value;
    const cardColor = document.getElementById('cardColorCreate').value;
    const cardContent = document.getElementById('cardContentCreate').value;
    const cardFile = document.getElementById('cardfileCreate').value;
    const card = {
      name: cardTitle,
      color: cardColor,
      content: cardContent,
      fileUrl: cardFile,
      members: selectedMemberNumber,
      sequence: cardSequence,
    };
    console.log('create 보내기 전 :', cardColumnId, cardSequence);
    CardCreate(cardColumnId, card);
  });
}

// column create api
async function BoardColumnsCreate(name, sequence) {
  await $.ajax({
    type: 'POST',
    url: `/board-columns?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ name, sequence }),
    success: function (data) {
      console.log(data.message);
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// column delete api
async function BoardColumnDelete(columnId) {
  $.ajax({
    type: 'DELETE',
    url: `/board-columns/${columnId}?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log(data.message);
      ColumnListReorder();
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// column name update api
async function BoardColumnNameUpdate(columnId, name) {
  $.ajax({
    type: 'PUT',
    url: `/board-columns/${columnId}?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ name }),
    success: (data) => {
      console.log(data.message);
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card get api
async function CardGet(columnId) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  // console.log(columnId);
  const result = await $.ajax({
    type: 'GET',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      return data;
    },
    error: (error) => {
      console.log(error);
    },
  });

  return result;
}

// card create api
async function CardCreate(columnId, data) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  console.log(columnId, data);
  await $.ajax({
    type: 'POST',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({
      name: data.name,
      content: data.content,
      file_url: data.fileUrl,
      sequence: data.sequence,
      members: data.members,
      color: data.color,
    }),
    success: function (data) {
      console.log(data.message);
      location.reload();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card detail get api
async function DetailCardGet(columnId, cardId) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  console.log(columnId, cardId);
  await $.ajax({
    type: 'GET',
    url: ``,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log('get card data : ', data);
      //comment api 추가
      DetailCard(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// detail card get html
async function DetailCard(data) {
  document.getElementById('exampleModalLabel').value = data.name;
  document.getElementById('cardDetailDescription').value = data.content;
  document.getElementById(
    'cardDetailImgFile'
  ).innerHTML = `<a href="./assets/img/american-express.png" download=""> <img src="./assets/img/american-express.png"> </a> `;
  const members = document.getElementById('cardDetailMembers');
  members.innerHTML = '';
  for (let i in data.members) {
    members.innerHTML += `<li>
                            <div class="checkbox-group d-flex">
                              <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
                                  <img src="기본 이미지(유저 이미지면 더 좋음)" style="border-radius: 50%; width: 50px; height: 50px; margin-right: 3%;">
                                  <label for="check-grp-${5 + i}" class=" strikethrough">
                                    ${data[i].members}
                                  </label>
                              </div>
                              <div class="dropdown dropdown-click">
                                  <button class="btn-link border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <img src="./assets/img/svg/more-horizontal.svg" alt="more-horizontal" class="svg">
                                  </button>
                                  <div class="dropdown-default dropdown-bottomRight dropdown-menu" style="">
                                    <a class="dropdown-item" href="#">Delete list</a>
                                  </div>
                              </div>
                            </div>
                        </li>`;
  }

  // card update 모달에도 기본적으로 값이 들어가있어야함
  document.getElementById('cardTitleUdpate').value = data.name;
  document.getElementById('cardContentUpdate').value = data.content;
  document.getElementById('cardfileUpdate').value = data.fileUrl;
  document.getElementById('cardColorUpdate').value = data.color;
  // 멤버 리스트 추가
  // cardMember조회
  const cardMemberData = await getCardMembers(data.id);
  const selectedMembersList = document.querySelector('#cardUpdateMembers');

  selectedMembersList.innerHTML = '';
  for (const member of cardMemberData.members) {
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

  $('#updateCardModal').modal('show');
}

// 멤버 찾기 workspace에서 붙여옴
let typingTimer;
let selectedMembers = [];
let selectedMemberNumber = [];
$(document).ready(async () => {
  const memberInput = document.querySelector('#cardCreateAddMemberBtn');
  const selectedMemberList = document.querySelector('#cardCreateMemberView');

  memberInput.addEventListener('click', (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
      const results = await searchMembers();
      console.log(results);

      document.getElementById(e.target.id).addEventListener('click', () => {
        console.log('id 확인 : ', e.target.id);
      });
      selectedMemberList.innerHTML = '';
      for (let result of results) {
        let Img = result.profileUrl ? result.profileUrl : '/assets/img/favicon.png';
        let data = `<li>
                          <a href="#">
                            <img class="rounded-circle wh-34 bg-opacity-secondary" src="${Img}" alt="${result.name}">
                          </a>
                          <span>${result.name}</span>
                        </li>`;
        const li = document.createElement('li');
        li.innerHTML = data;
        selectedMemberList.appendChild(li);

        li.addEventListener('click', () => {
          if (!selectedMemberNumber.includes(result.userId)) {
            selectedMembers.push({ name: result.name, id: result.userId });
            console.log('click함', selectedMembers);
            selectedMemberNumber.push(result.userId);
            updateSelectedMembersUI();
          }
        });
      }
    });
  });
});

// 유저검색
async function searchMembers() {
  try {
    const { boardMembers } = await $.ajax({
      method: 'GET',
      url: `/boards/${boardId}/members`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });
    return boardMembers;
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
    <li>${member.name} <span class="remove-member" data-member="${member.id}">x</span></li>
  `
    )
    .join('');

  // 재선택 시 삭제
  const removeIcons = selectedMemberList.querySelectorAll('.remove-member');
  removeIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      const memberRemove = e.target.getAttribute('data-member');
      selectedMembers = selectedMembers.filter((name) => name.id !== memberRemove);
      selectedMemberNumber = selectedMemberNumber.filter((id) => id !== memberRemove);
      updateSelectedMembersUI();
    });
  });
}

// 카드 디테일에서 comment + 버튼 클릭 시
document.getElementById('commentBoxBtn').addEventListener('click', () => {
  if ($('#commentBox').css('display') == 'none') {
    $('#commentBox').show();
  } else {
    $('#commentBox').hide();
  }
});

// 카드 수정 멤버 추가 버튼 클릭 시
document.getElementById('cardUpdateAddMembers').addEventListener('click', () => {
  if ($('#cardUpdateAddMemberBox').css('display') == 'none') {
    $('#cardUpdateAddMemberBox').show();
  } else {
    $('#cardUpdateAddMemberBox').hide();
  }
});

// card sequence update api
async function CardSequenceUpdate(columnId, cardId, sequence) {
  $.ajax({
    type: 'PUT',
    url: `cards/${cardId}/sequence?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({ sequence }),
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card update api / detail modal -> update btn click -> submit btn click
async function CardAllUpdate(columnId, cardId, data) {
  console.log('CardAllUpdate : ', columnId, cardId, data);
  // 쿼리를 사용하려면 -> 예시 : url: `/board-columns/${columnId}/sequence?boardId=` + boardId,
  $.ajax({
    type: 'PUT',
    url: ``,
    data: JSON.stringify({}),
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card delete api
async function CardDelete(columnId, cardId) {
  $.ajax({
    type: 'DELETE',
    url: `/cards/${cardId}?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log(data.message);
    },
    error: (error) => {
      console.log(error);
    },
  });
}
