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
// const accessToken = localStorage.getItem('accessToken');
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

  // Object.values($('.kanban-container,.todo-task2 tbody')).forEach(async (column, index) => {
  //   console.log('testest: ', column, index);
  // });
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
    console.log('card list : ', card, index + 1, columnId, cardId);
    console.log(card.parentElement.getAttribute('data-columnId'));
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
    data: JSON.stringify({ sequence }),
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

// get column API
async function BoardColumnsGet() {
  // data: {boardId: boardId}
  await $.ajax({
    type: 'GET',
    url: `/board-columns?boardId=` + boardId,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: async (data) => {
      BoardColumns(data);
      for (let i in data) {
        await CardGet(data[i].columnId);
      }
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get board column, card getHtml
// 아직 card api가 없기 때문에 column만 일단 넣음
async function BoardColumns(data) {
  // console.log(data);
  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = '';
  let i = 0;
  for (i in data) {
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
                                  <ul class="kanban-items list-items  drag-drop " data-columnId="${data[i].columnId}">
                                    <li class="d-flex justify-content-between align-items-center " data-cardId=>
                                        <div class="lists-items-title" data-bs-toggle="modal" data-bs-target="#exampleModal" data-whatever="@mdo72">
                                          File Manager Design
                                        </div>
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
                                    </li>
                                    <li class="d-flex justify-content-between align-items-center ">
                                        <div class="lists-items-title" data-bs-toggle="modal" data-bs-target="#exampleModal" data-whatever="@mdo6">
                                          Knowledgebase
                                        </div>
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
                                    </li>
                                  </ul>
                                </div>

                              </div>`;
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
    data: JSON.stringify({ name }),
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
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
  $.ajax({
    type: 'GET',
    url: `/cards?board_column_Id=${columnId}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      Cards(data, columnId);

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
          console.log('tt', sequence, cardSequence, cardColumnId);
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
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card get html
let cardIndex = 0;
function Cards(data, columnId) {
  const cardHtml = document.querySelector(`#cardListItems${columnId}`);

  const ulHtml = cardHtml.children[0];
  ulHtml.innerHTML = '';

  // card data 입력
  let i = 0;
  for (i = 0; i < data.length; i++) {
    ulHtml.innerHTML += `
  <li class="d-flex justify-content-between align-items-center" draggable="true" id="card-list-item" data-columnId="${columnId}" data-cardId="${data[i].id}">
    <div class="lists-items-title" style="background-color: ${data[i].color}" onclick="openCardDetailModal('${columnId}', '${data[i].id}')">
      ${data[i].name}
    </div>
    <button class="open-popup-modal" type="button">
      <img src="./assets/img/svg/edit-2.svg" alt="edit-2" class="svg">
    </button>
    <div class="popup-overlay">
      <!-- Creates the popup content -->
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
  </li>`;
  }
  cardIndex += i;
  cardHtml.innerHTML += `
    <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-columnId="${columnId}" data-index="${cardIndex}">
      <img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a card
    </button>`;
  init();
  return { cardHtml, index: i + 1 };
}

// card create api
async function CardCreate(columnId, data) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  // console.log(columnId, data);
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

// 카드 세부 정보 모달을 생성하는 함수
function createCardDetailModal(data) {
  // 모달 바디의 HTML을 생성
  const modalBodyHTML = `
      <h5 class="modal-title" id="exampleModalLabel">${data.name}</h5>
      <p id="cardDetailDescription">${data.content}</p>
      <div id="cardDetailImgFile">
        <a href="${data.file_url}" download="">
          <img src="${data.file_url}" alt="${data.name}">
        </a>
      </div>
  `;

  // 멤버 리스트의 HTML을 생성
  let membersHTML = '';
  for (const member of data.members) {
    membersHTML += `
      <li>
        <div class="checkbox-group d-flex">
          <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
            <img src="${member.profile_url}" style="border-radius: 50%; width: 50px; height: 50px; margin-right: 3%;">
            <label for="check-grp-${member.id}" class="strikethrough">
              ${member.name}
            </label>
          </div>
        </div>
      </li>
    `;
  }

  const modalContentHTML = `
  <div class=" kanban-modal__header-wrapper">
    <div class="kanban-modal__header">
      <h5 class="modal-title" id="exampleModalLabel">${data.name}</h5>
      <span>in list Active Project</span>
    </div>
    <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary "
      data-bs-toggle="modal" data-bs-target="#updateCardModal">update</button>
    <button class="btn btn-primary btn-sm btn-squared btn-transparent-primary "
      id="cardDeleteBtn">delete</button>
    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
      <img src="./assets/img/svg/x.svg" alt="x" class="svg">
    </button>
  </div>
  <div class="modal-body kanban-modal__body">
    <div class="kanban-modal__form ">
      <div class="mb-30">
        <label for="exampleFormControlTextarea1111" class="form-label">Description</label>
        <textarea class="form-control" readonly rows="3" id="cardDetailDescription">${data.content}</textarea>
      </div>
      <div class="row">
        <label> image file</label>
        <div id="cardDetailImgFile"></div>
        <a href="./assets/img/american-express.png" download=""> <img
                                          src="./assets/img/american-express.png"> </a>
                                    <a href="./assets/img/american-express.png" download=""> <img
                                          src="./assets/img/american-express.png"> </a>
        <label style="margin-top: 3%;">Files other than image files</label>
        <div id="cardDetailNotImgFile"></div>
        <a href="./assets/img/american-express.png" download=""> 파일명 </a>
        <a href="./assets/img/american-express.png" download=""> 파일명 </a>
     </div>
      </div>
    </div>

    <div class="kanban-modal__research mt-30">
      <h6>Members </h6>
    </div>
    <div class="kanban-modal__list">
      <ul id="cardDetailMembers">
        ${membersHTML}
      </ul>
    </div>
  </div>
`;

  // 새로운 모달을 생성
  const modal = document.createElement('div');
  modal.className = 'modal fade kanban-modal__card kanban__modal';
  modal.id = 'exampleModal';
  modal.tabIndex = '-1';
  modal.setAttribute('aria-labelledby', 'exampleModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        ${modalContentHTML}
      </div>
    </div>
  `;

  // 모달을 body에 추가
  document.body.appendChild(modal);

  // 모달을 화면에 표시
  $(modal).modal('show');
}

// 카드 세부 정보 모달을 열기 위한 함수
function openCardDetailModal(columnId, cardId) {
  // 카드 세부 정보를 서버에서 가져오는 API 호출
  DetailCardGet(columnId, cardId);
}

// card detail get api
async function DetailCardGet(columnId, cardId) {
  try {
    // API를 호출하여 카드 세부 정보 가져오기
    const response = await $.ajax({
      type: 'GET',
      url: `/cards/${cardId}?board_column_Id=${columnId}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
      },
    });

    // API 응답 데이터에서 카드 정보 추출
    const data = response;

    // 카드 세부 정보 모달을 생성하고 데이터를 전달
    createCardDetailModal(data);
  } catch (error) {
    console.log(error);
  }
}

// card sequence update api
async function CardSequenceUpdate(columnId, cardId, sequence) {
  console.log('CardSequenceUpdate : ', columnId, cardId, sequence);
  $.ajax({
    type: 'PUT',
    url: `cards/${cardId}/sequence?board_column_Id=${columnId}`,
    data: JSON.stringify({ sequence }),
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

// card update api / detail modal -> update btn click -> submit btn click
async function CardAllUpdate(columnId, cardId, data) {
  console.log('CardAllUpdate : ', columnId, cardId, data);
  // 쿼리를 사용하려면 -> 예시 : url: `/board-columns/${columnId}/sequence?boardId=` + boardId,
  $.ajax({
    type: 'PUT',
    url: ``,
    data: JSON.stringify({}),
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
