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
const accessToken = localStorage.getItem('accessToken');
let boardId = new URLSearchParams(window.location.search).get('boardId');
// boardId = Number(boardId);
boardId = 8;

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
  Object.values($('.list-items').children('li')).forEach(async (card, index) => {
    console.log('card list : ', card, index + 1);
    // await CardSequenceUpdate(columnId, cardId, sequence);
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
    success: (data) => {
      BoardColumns(data);
      init();
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// get board column, card getHtml
// 아직 card api가 없기 때문에 column만 일단 넣음
function BoardColumns(data) {
  // console.log(data);
  const kanbanList = document.querySelector('.kanban-container');
  kanbanList.innerHTML = '';
  let i = 0;
  for (i in data) {
    // const {cardHtml, index} = CardGet(data[i].columnId);
    // console.log('BoardColumns in :', cardHtml);
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

                            <ul class="kanban-items list-items  drag-drop ">

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

                            <button class="add-card-btn" data-bs-toggle="modal" data-bs-target="#createCardModal" id="createCard" data-cardId="cardId넣어주세요" data-columnId="columnId 넣어주세요" data-index="변수index를 넣어주세요"><img src="./assets/img/svg/plus.svg" alt="plus" class="svg"> Add a
                              card</button>

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
    data.addEventListener('click', async () => {
      const columnId = data.getAttribute('value');
      await BoardColumnDelete(columnId);
    });
  });

  //모달창이 열리면 해당 모달창에 value값으로 columnId값을 보내거나 받아와야함
  let columnId;
  document.querySelectorAll('#updateColumnTitle').forEach((data) => {
    data.addEventListener('click', () => {
      const id = data.getAttribute('data-value');
      const title = data.getAttribute('data-title');
      document.getElementById('columnTitleUpdate').value = title;
      columnId = id;
    });
  });

  document.getElementById('ColumnUpdateNameBtn').addEventListener('click', async () => {
    const columnTitle = document.getElementById('columnTitleUpdate').value;
    await BoardColumnNameUpdate(columnId, columnTitle);
  });

  // card create button click
  //모달 창이 열리면 해당 columnId값을 보내줘야함
  let cardSequence;
  document.querySelectorAll('createCard').forEach((data) => {
    data.addEventListener('click', () => {
      const id = data.getAttribute('data-columnId');
      columnId = id;
      cardSequence = Number(data.getAttribute('data-index')) + 1;
    });
  });

  document.getElementById('CardCreateBtn').addEventListener('click', () => {
    const cardTitle = document.getElementById('cardTitleCreate').value;
    const cardColor = document.getElementById('cardColorCreate').value;
    const cardContent = document.getElementById('cardContentCreate').value;
    const cardFile = document.getElementById('cardfileCreate').value;
    // const members = 로그인한 멤버 이름
    const card = {
      name: cardTitle,
      color: cardColor,
      content: cardContent,
      fileUrl: cardFile,
      members,
      sequence: cardSequence,
    };

    // CardCreate(columnId,card);
  });

  // card detail box click
  // 모달창이 열리면 해당하는 card 값들을 뿌려주기, member초대란 만들기, 댓글란 만들기
  document.querySelectorAll('#card-list-item').forEach((data) => {
    data.addEventListener('click', () => {
      const cardId = data.getAttribute('data-cardId');
      columnId = data.getAttribute('data-columnId');

      DetailCardGet(columnId, cardId);
    });
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
  console.log(columnId);
  await $.ajax({
    type: 'GET',
    url: ``,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    success: (data) => {
      console.log('get card data : ', data);
      Cards(data, columnId);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// card get html
function Cards(data, columnId) {
  const cardHtml = document.querySelector('.drag-drop');
  cardHtml = '';

  // card data 입력
  let i = 0;
  for (i in data) {
    console.log(`Cards in card ${i} : `, data[i]);
    cardHtml += `<li class="d-flex justify-content-between align-items-center " id="card-list-item" data-columnId=${columnId} data-cardId=cardId를 넣어주세요>
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
                </li>`;
  }
  return { cardHtml, index: i };
}

// card create api
async function CardCreate(columnId, data) {
  // url에서 쿼리가 필요한 경우 -> 예시 : url: `/board-columns?boardId=` + boardId,
  console.log(columnId, data);
  await $.ajax({
    type: 'POST',
    url: ``,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
    },
    data: JSON.stringify({}),
    success: function (data) {
      console.log(data.message);
      // location.reload();
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
      DetailCard(data);
    },
    error: (error) => {
      console.log(error);
    },
  });
}

// detail card get html
function DetailCard(data) {
  // detail card 모달 수정해야하고, id값을 정해서 value에 값을 넣어줘야함...(오후에 하자..)
}

// card sequence update api
async function CardSequenceUpdate(columnId, cardId, sequence) {
  console.log('CardSequenceUpdate : ', columnId, cardId, sequence);
  // 쿼리를 사용하려면 -> 예시 : url: `/board-columns/${columnId}/sequence?boardId=` + boardId,
  $.ajax({
    type: 'PUT',
    url: ``,
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
function CardAllUpdate(columnId, cardId, data) {
  console.log('CardSequenceUpdate : ', columnId, cardId, data);
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
